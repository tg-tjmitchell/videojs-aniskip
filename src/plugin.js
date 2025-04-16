import videojs from 'video.js';

// Default options for the plugin.
const defaults = {
  skipRanges: [],
  buttonText: 'Skip',
  buttonClass: 'vjs-aniskip-button',
  notificationClass: 'vjs-aniskip-notification',
  notificationText: 'Skipping...'
};

/**
 * Function to register the plugin
 *
 * @param {object} [options] - User options object
 */
const AniskipPlugin = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

/**
 * Initialize the plugin.
 *
 * @param {Player} player - The Video.js player instance
 * @param {Object} options - The plugin options
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-aniskip');
  
  // Create skip button component
  const SkipButton = videojs.extend(videojs.getComponent('Button'), {
    constructor: function(player, options) {
      videojs.getComponent('Button').call(this, player, options);
      this.addClass(options.buttonClass);
      this.controlText(options.buttonText);
    },
    handleClick: function() {
      if (player.aniskipCurrentSkipRange) {
        player.currentTime(player.aniskipCurrentSkipRange.end);
        player.aniskipCurrentSkipRange = null;
        hideSkipButton();
        showNotification();
      }
    }
  });
  
  // Create notification component
  const createNotification = () => {
    const notification = document.createElement('div');
    notification.className = options.notificationClass;
    notification.textContent = options.notificationText;
    notification.style.display = 'none';
    player.el().appendChild(notification);
    return notification;
  };
  
  // Create and add the button to the control bar
  const skipButton = new SkipButton(player, options);
  player.controlBar.addChild(skipButton);
  
  // Hide the button initially
  const hideSkipButton = () => {
    skipButton.hide();
  };
  
  // Show the button
  const showSkipButton = () => {
    skipButton.show();
  };
  
  // Create notification element
  const notification = createNotification();
  
  // Show notification when skipping
  const showNotification = () => {
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 2000);
  };
  
  hideSkipButton();
  
  // Set up time update handler to check for skip ranges
  player.on('timeupdate', function() {
    const currentTime = player.currentTime();
    
    // Check if we're in a skip range
    const inSkipRange = options.skipRanges.find(range => 
      currentTime >= range.start && currentTime < range.end
    );
    
    if (inSkipRange && !player.aniskipCurrentSkipRange) {
      player.aniskipCurrentSkipRange = inSkipRange;
      showSkipButton();
    } else if (!inSkipRange && player.aniskipCurrentSkipRange) {
      player.aniskipCurrentSkipRange = null;
      hideSkipButton();
    }
  });
};

// Register the plugin with video.js.
videojs.registerPlugin('aniskip', AniskipPlugin);

// Export the plugin
export default AniskipPlugin;