# Stock Footage Implementation Plan

## Goal
Implement "Strategy 2" from `VIDEO_STRATEGY.md`: Replace/augment static AI images with free stock footage from Pexels API to create more dynamic videos at zero cost.

## User Review Required
> [!IMPORTANT]
> You will need to obtain a free **Pexels API Key** from [pexels.com/api](https://www.pexels.com/api/) and add it to your `.env.local` as `PEXELS_API_KEY`.

## Proposed Changes

### 1. New Pexels Client Service
**Create `lib/external/pexels-client.ts`**
- Implement `searchVideos(query: string)` function.
- Fetch 1080p/4K MP4 files.
- Fallback to static images if no video is found or API is unavailable.

### 2. Update Content Generation Logic
**Modify `lib/ai/content-generator.ts` (or equivalent)**
- Instead of just generating image prompts, extract "stock video keywords" from the script.
- Call Pexels Client to get video URLs.
- Pass `videoUrl` to the Remotion composition.

### 3. Update Remotion Composition
**Modify `app/remotion/SlideshowComposition.tsx`**
- Update `Scene` interface to include optional `videoUrl`.
- If `videoUrl` is present, render `<Video>` instead of `<Img>`.
- Remove "Ken Burns" zoom effect for video clips (they already move).
- Ensure "OBJECT_FIT: cover" behavior for mixed aspect ratios.

## Verification Plan
### Automated Tests
- Unit test `pexels-client.ts` (mocked response).

### Manual Verification
1. Add `PEXELS_API_KEY` to `.env.local`.
2. Run the video generation flow.
3. Verify that the output video contains moving stock footage instead of static images.
