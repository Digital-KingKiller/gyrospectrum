
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0'

export async function sendWhatsAppMessage(to: string, body: string) {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!accessToken || !phoneNumberId) {
        console.error('WhatsApp credentials not configured')
        return null
    }

    try {
        const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: to,
                type: 'text',
                text: { body: body },
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Error sending WhatsApp message:', JSON.stringify(error, null, 2))
            throw new Error(`WhatsApp API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error)
        throw error
    }
}
