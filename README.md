# videojs-aniskip

A Video.js plugin for skipping anime intro/outro segments using the AniSkip API.

## Installation

```bash
npm install --save github:tg-tjmitchell/videojs-aniskip
```

## Features

- Fetch skip ranges from the AniSkip API
- Manual skip ranges for videos without API data
- Customizable skip button text and appearance
- Auto-skip functionality
- Event system for integration with your application

## Usage

To include videojs-aniskip on your website or web application, use any of the following methods.

### Basic Usage with AniSkip API

```js
import videojs from 'video.js';
import 'videojs-aniskip';

const player = videojs('my-video');

// Initialize the plugin with AniSkip API
const aniskip = player.aniskip({
  malId: 21, // MyAnimeList ID of the anime
  episodeNumber: 1, // Episode number
  types: ['op', 'ed'] // Skip both openings and endings
});

// Listen for skip events
aniskip.on('skip', (event, data) => {
  console.log('Skipped range:', data.range);
});
```

### Manual Skip Ranges

If you don't want to use the AniSkip API or need custom skip ranges:

```js
const player = videojs('my-video');

// Initialize with manual skip ranges
const aniskip = player.aniskip({
  skipRanges: [
    { start: 85, end: 105, type: 'op' }, // Opening
    { start: 1320, end: 1380, type: 'ed' } // Ending
  ],
  buttonText: {
    op: 'Skip Intro',
    ed: 'Skip Outro'
  }
});
```

### CommonJS/Browserify

```js
const videojs = require('video.js');
require('videojs-aniskip');

const player = videojs('my-video');

// Initialize the plugin
const aniskip = player.aniskip({
  malId: 21,
  episodeNumber: 1
});
```

### CDN/Script Tag

```html
<link href="https://unpkg.com/video.js/dist/video-js.min.css" rel="stylesheet">
<script src="https://unpkg.com/video.js/dist/video.min.js"></script>
<script src="path/to/videojs-aniskip.min.js"></script>
<link rel="stylesheet" href="path/to/videojs-aniskip.css">

<script>
  var player = videojs('my-video');
  
  // Initialize the plugin with AniSkip API
  var aniskip = player.aniskip({
    malId: 21,
    episodeNumber: 1
  });
</script>
```

## Customizing the Plugin Appearance

The plugin uses CSS variables to make styling customization easy. You can override these variables in your own CSS to change the appearance and position of the skip button and notification elements.

### Available CSS Variables

```css
.video-js {
  /* Position */
  --aniskip-button-right: 10px;
  --aniskip-button-bottom: 70px;
  --aniskip-button-fullscreen-bottom: 90px;
  
  /* Colors & Styling */
  --aniskip-button-bg: rgba(43, 51, 63, 0.7);
  --aniskip-button-hover-bg: rgba(38, 104, 217, 0.9);
  --aniskip-button-padding: 8px 14px;
  --aniskip-button-font-size: 14px;
  --aniskip-notification-bg: rgba(0, 0, 0, 0.7);
}
```

### Customization Example

To customize the plugin appearance, add your own CSS overrides after including the plugin CSS:

```html
<link href="path/to/videojs-aniskip.css" rel="stylesheet">
<style>
  /* Custom positioning */
  .video-js {
    --aniskip-button-right: 20px;
    --aniskip-button-bottom: 50px;
    --aniskip-button-fullscreen-bottom: 80px;
    
    /* Custom styling */
    --aniskip-button-bg: rgba(200, 0, 0, 0.7);
    --aniskip-button-hover-bg: rgba(255, 0, 0, 0.9);
    --aniskip-button-padding: 10px 16px;
    --aniskip-button-font-size: 16px;
  }
  
  /* Additional custom styles */
  .video-js .vjs-aniskip-button {
    border-radius: 20px; /* Make the button more rounded */
    font-weight: 700;
  }
</style>
```

### Completely Custom Styling

If you need more extensive customization, you can completely override the plugin's styles:

```css
/* First, disable the default styling */
.video-js .vjs-aniskip-button {
  /* Reset the button styling */
  background: none;
  box-shadow: none;
  text-shadow: none;
  
  /* Your custom styles */
  background-color: #ff0000;
  border-radius: 0;
  /* etc. */
}

/* Position the button in a different location */
.video-js .vjs-aniskip-button {
  top: 20px;
  right: 20px;
  bottom: auto;
  left: auto;
}
```

## Options

These are the available options for the plugin:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `apiBaseUrl` | String | `'https://api.aniskip.com/v2'` | Base URL for the AniSkip API |
| `malId` | Number | `null` | MyAnimeList ID of the anime |
| `episodeNumber` | Number | `null` | Episode number to fetch skip segments for |
| `episodeLength` | Number | `null` | Length of the episode in seconds (auto-detected if not provided) |
| `types` | Array | `['op', 'ed']` | Types of segments to skip (op = opening, ed = ending) |
| `buttonText` | Object | `{ op: 'Skip Intro', ed: 'Skip Outro', default: 'Skip' }` | Text to display on the skip button |
| `buttonClass` | String | `'vjs-aniskip-button'` | CSS class for the skip button |
| `notificationClass` | String | `'vjs-aniskip-notification'` | CSS class for the skip notification |
| `notificationText` | Object | `{ op: 'Skipping intro...', ed: 'Skipping outro...', default: 'Skipping...' }` | Text to display when skipping |
| `skipRanges` | Array | `[]` | Manual skip ranges to use if not using the API |
| `autoSkip` | Boolean | `false` | Whether to automatically skip without showing the button |
| `offset` | Number | `0` | Time offset in seconds to adjust all timestamps (if video doesn't start at 0) |

### Skip Range Format

Each skip range object should have the following format:

```js
{
  start: 85, // Start time in seconds
  end: 105,  // End time in seconds
  type: 'op' // Type of segment: 'op' (opening), 'ed' (ending), or any custom type
}
```

## Events

The plugin provides the following events:

| Event | Description | Data |
| --- | --- | --- |
| `skip` | Fired when a segment is skipped | `{ range: { start, end, type } }` |
| `statechanged` | Fired when the plugin's state changes | Contains the changed state properties |
| `segmentsloaded` | Fired when segments are loaded from the API | `{ segments: [...] }` |
| `error` | Fired when an error occurs | `{ error: Error }` |

## State

The plugin has the following state properties:

| Property | Type | Description |
| --- | --- | --- |
| `isLoading` | Boolean | Whether the plugin is currently loading data from the API |
| `error` | String | Error message if an error occurred, otherwise null |
| `inSkipRange` | Boolean | Whether the playback is currently within a skip range |
| `currentSkipRange` | Object | The current skip range object if within one, otherwise null |
| `skipSegments` | Array | List of all skip segments available |

## Methods

| Method | Description |
| --- | --- |
| `dispose()` | Cleans up the plugin instance |
| `fetchSkipSegments()` | Manually trigger fetching segments from the AniSkip API |

## License

MIT. Copyright (c) tg-tjmitchell