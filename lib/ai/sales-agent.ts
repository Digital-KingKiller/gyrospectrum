// @ts-nocheck
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase/client'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'
import { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']
type Conversation = Database['public']['Tables']['conversations']['Row']

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

interface SalesAgentResponse {
    message: string
    intent: string
    sentiment: string
    qualification_score: number
    next_action: 'respond' | 'book' | 'escalate' | 'close'
    booking_details?: any
}

export class SalesAgent {
    private model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' })

    /**
     * Handle incoming message from a lead
     */
    async handleMessage(
        businessId: string,
        leadId: string,
        userMessage: string,
        platform: string
    ): Promise<SalesAgentResponse> {
        try {
            // Get or create conversation
            let conversation = await this.getOrCreateConversation(businessId, leadId, platform)

            // Get business context
            const { data: business } = await supabaseAdmin
                .from('businesses')
                .select('*')
                .eq('id', businessId)
                .single()

            if (!business) {
                throw new Error('Business not found')
            }

            // Get lead context
            const { data: lead } = await supabaseAdmin
                .from('leads')
                .select('*')
                .eq('id', leadId)
                .single()

            // Build conversation history
            const messages: Message[] = (conversation.messages as any) || []
            messages.push({
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString(),
            })

            // Generate AI response
            const aiResponse = await this.generateResponse(business, lead, messages)

            // Add assistant message to history
            messages.push({
                role: 'assistant',
                content: aiResponse.message,
                timestamp: new Date().toISOString(),
            })

            // Update conversation
            await supabaseAdmin
                .from('conversations')
                .update({
                    messages: messages as any,
                    detected_intent: aiResponse.intent,
                    sentiment: aiResponse.sentiment,
                    last_message_at: new Date().toISOString(),
                    status: aiResponse.next_action === 'close' ? 'closed' : 'active',
                })
                .eq('id', conversation.id)

            // Update lead qualification score
            await supabaseAdmin
                .from('leads')
                .update({
                    qualification_score: aiResponse.qualification_score,
                    intent: aiResponse.intent,
                    status: aiResponse.next_action === 'close' ? 'converted' : 'contacted',
                })
                .eq('id', leadId)

            // If booking action, create booking
            if (aiResponse.next_action === 'book' && aiResponse.booking_details) {
                await this.createBooking(businessId, leadId, conversation.id, aiResponse.booking_details)
            }

            return aiResponse
        } catch (error) {
            console.error('Error handling message:', error)
            throw error
        }
    }

    /**
     * Generate AI response to user message
     */
    private async generateResponse(
        business: any,
        lead: any,
        messages: Message[]
    ): Promise<SalesAgentResponse> {
        const conversationHistory = messages
            .map((m) => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`)
            .join('\n')

        const prompt = `
You are an AI sales agent for ${business.name}. Your goal is to help customers and close sales.

Business Information:
- Name: ${business.name}
- Description: ${business.description}
- Industry: ${business.industry || 'Not specified'}
- Value Proposition: ${business.unique_value_proposition || 'N/A'}

Customer Information:
- Name: ${lead?.name || 'Unknown'}
- Email: ${lead?.email || 'Not provided'}
- Phone: ${lead?.phone || 'Not provided'}
- Source: ${lead?.source_platform || 'Unknown'}

Conversation History:
${conversationHistory}

Instructions:
1. Respond naturally and helpfully to the customer's latest message
2. Detect the customer's intent (inquiry, booking, support, complaint, etc.)
3. Assess their sentiment (positive, neutral, negative)
4. Qualify the lead (score from 0.0 to 1.0 based on purchase intent)
5. Determine the next action (respond, book, escalate, close)
6. If they're ready to book, extract booking details

Response Format (JSON):
{
  "message": "Your friendly response to the customer",
  "intent": "inquiry|booking|support|complaint|other",
  "sentiment": "positive|neutral|negative",
  "qualification_score": 0.0-1.0,
  "next_action": "respond|book|escalate|close",
  "booking_details": {
    "booking_type": "car_wash|hotel|isp_connection|other",
    "service_date": "ISO date if mentioned",
    "service_details": {"any": "extracted details"}
  }
}

Return ONLY the JSON object, no additional text.
`

        try {
            const result = await this.model.generateContent(prompt)
            const response = result.response.text()

            const jsonMatch = response.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('No valid JSON in AI response')
            }

            return JSON.parse(jsonMatch[0])
        } catch (error) {
            console.error('Error generating AI response:', error)
            // Fallback response
            return {
                message: "Thank you for your message! I'm here to help. Could you tell me more about what you're looking for?",
                intent: 'inquiry',
                sentiment: 'neutral',
                qualification_score: 0.5,
                next_action: 'respond',
            }
        }
    }

    /**
     * Get or create conversation for a lead
     */
    private async getOrCreateConversation(
        businessId: string,
        leadId: string,
        platform: string
    ): Promise<any> {
        // Try to find existing active conversation
        const { data: existing } = await supabaseAdmin
            .from('conversations')
            .select('*')
            .eq('business_id', businessId)
            .eq('lead_id', leadId)
            .eq('status', 'active')
            .single()

        if (existing) {
            return existing
        }

        // Create new conversation
        const { data: newConversation, error } = await supabaseAdmin
            .from('conversations')
            .insert({
                business_id: businessId,
                lead_id: leadId,
                platform,
                messages: [],
                status: 'active',
            })
            .select()
            .single()

        if (error) {
            throw new Error('Failed to create conversation')
        }

        return newConversation
    }

    /**
     * Create a booking from conversation
     */
    private async createBooking(
        businessId: string,
        leadId: string,
        conversationId: string,
        bookingDetails: any
    ) {
        try {
            await supabaseAdmin.from('bookings').insert({
                business_id: businessId,
                lead_id: leadId,
                conversation_id: conversationId,
                booking_type: bookingDetails.booking_type,
                service_date: bookingDetails.service_date,
                service_details: bookingDetails.service_details,
                status: 'pending',
            })
        } catch (error) {
            console.error('Error creating booking:', error)
        }
    }

    /**
     * Send automated follow-up message
     */
    async sendFollowUp(leadId: string, followUpType: 'reminder' | 'thank_you' | 'feedback') {
        try {
            const { data: lead } = await supabaseAdmin
                .from('leads')
                .select('*, conversations(*)')
                .eq('id', leadId)
                .single()

            if (!lead) {
                return
            }

            let followUpMessage = ''

            switch (followUpType) {
                case 'reminder':
                    followUpMessage =
                        "Hi! Just following up on our conversation. Is there anything else I can help you with?"
                    break
                case 'thank_you':
                    followUpMessage =
                        "Thank you for choosing us! We're excited to serve you. If you have any questions, feel free to ask!"
                    break
                case 'feedback':
                    followUpMessage =
                        "We'd love to hear about your experience! Could you share your feedback with us?"
                    break
            }

            // In a real implementation, this would send via the actual platform API
            console.log(`Follow-up message to ${lead.name}: ${followUpMessage}`)

            if (lead.phone && lead.source_platform === 'whatsapp') {
                await sendWhatsAppMessage(lead.phone, followUpMessage)
            }

            return followUpMessage
        } catch (error) {
            console.error('Error sending follow-up:', error)
        }
    }
}

