# videojs-aniskip

A Video.js plugin for skipping anime intro/outro segments.

## Installation

```bash
npm install --save github:username/videojs-aniskip
```

You can replace `username` with your GitHub username after pushing this project to GitHub.

## Usage

To include videojs-aniskip on your website or web application, use any of the following methods.

### ES Modules

```js
import videojs from 'video.js';
import 'videojs-aniskip';

const player = videojs('my-video');

player.aniskip({
  skipRanges: [
    { start: 85, end: 105, type: 'intro' },
    { start: 1320, end: 1380, type: 'outro' }
  ],
  buttonText: 'Skip Intro'
});
```

### CommonJS/Browserify

```js
const videojs = require('video.js');
require('videojs-aniskip');

const player = videojs('my-video');

player.aniskip({
  skipRanges: [
    { start: 85, end: 105, type: 'intro' },
    { start: 1320, end: 1380, type: 'outro' }
  ]
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
  
  player.aniskip({
    skipRanges: [
      { start: 85, end: 105, type: 'intro' },
      { start: 1320, end: 1380, type: 'outro' }
    ]
  });
</script>
```

## Options

These are the available options for the plugin:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `skipRanges` | Array | `[]` | Array of objects with `start`, `end`, and optional `type` properties |
| `buttonText` | String | `'Skip'` | Text to display on the skip button |
| `buttonClass` | String | `'vjs-aniskip-button'` | CSS class for the skip button |
| `notificationClass` | String | `'vjs-aniskip-notification'` | CSS class for the skip notification |
| `notificationText` | String | `'Skipping...'` | Text to display when skipping |

## License

MIT. Copyright (c) [Your Name]