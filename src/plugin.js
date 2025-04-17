import videojs from 'video.js';

// Default options for the plugin.
const defaults = {
  apiBaseUrl: 'https://api.aniskip.com/v1',  // Updated to v1 instead of v2
  malId: null, // MyAnimeList ID
  episodeNumber: null,
  episodeLength: null, // Episode length in seconds
  types: ['op', 'ed'], // Types of segments to skip (op = opening, ed = ending)
  buttonText: {
    op: 'Skip Intro',
    ed: 'Skip Outro',
    default: 'Skip'
  },
  buttonClass: 'vjs-aniskip-button',
  notificationClass: 'vjs-aniskip-notification',
  notificationText: {
    op: 'Skipping intro...',
    ed: 'Skipping outro...',
    default: 'Skipping...'
  },
  skipRanges: [], // Manual skip ranges if API is not used
  autoSkip: false, // Whether to automatically skip without showing the button
  offset: 0 // Time offset in seconds to adjust all timestamps (if video doesn't start at 0)
};

// Get a reference to the Plugin class
const Plugin = videojs.getPlugin('plugin');

/**
 * An advanced plugin for Video.js that provides functionality
 * for skipping anime intro/outro segments using the AniSkip API.
 *
 * @class AniskipPlugin
 * @extends Plugin
 */
class AniskipPlugin extends Plugin {
  /**
   * Create a AniskipPlugin instance.
   *
   * @param {Player} player
   *        A Video.js Player instance.
   *
   * @param {Object} [options]
   *        An optional options object.
   */
  constructor(player, options) {
    // Call the parent constructor to initialize plugin
    super(player, options);
    
    // Initialize the plugin
    this.options = videojs.obj.merge(defaults, options);
    this.player = player;
    this.skipButton = null;
    this.notification = null;
    this.skipSegments = [];
    
    // Add a class to the player
    player.addClass('vjs-aniskip');
    
    this.initializeUI();
    this.setupEventListeners();
    
    // Fetch skip segments from API or use provided skipRanges
    if (this.options.malId && this.options.episodeNumber) {
      this.fetchSkipSegments();
    } else if (this.options.skipRanges && this.options.skipRanges.length) {
      this.skipSegments = this.options.skipRanges;
      this.log('Using provided skip ranges');
    } else {
      this.log('No MAL ID or episode number provided, and no skip ranges provided');
    }
    
    // Log plugin initialization
    this.log('initialized!');
  }
  
  /**
   * Fetch skip segments from AniSkip API
   */
  fetchSkipSegments() {
    this.setState({ isLoading: true });
    
    const { malId, episodeNumber, apiBaseUrl, types } = this.options;
    
    // Updated URL format based on the ani-skip script's implementation
    // Uses separate 'types=' query parameters for each type instead of comma-separated values
    const queryParams = types.map(type => `types=${type}`).join('&');
    const url = `${apiBaseUrl}/skip-times/${malId}/${episodeNumber}?${queryParams}`;
    
    this.log(`Fetching skip segments from ${url}`);
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`AniSkip API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.log('API response received:', data);
        
        if (data.found && data.results && data.results.length > 0) {
          // Transform API results to our format
          // Fix: Use correct property names from API response (snake_case instead of camelCase)
          this.skipSegments = data.results.map(result => ({
            start: result.interval.start_time,
            end: result.interval.end_time,
            type: result.skip_type,
            episodeLength: result.episode_length
          }));
          
          this.log(`Found ${this.skipSegments.length} skip segments`);
          this.trigger('segmentsloaded', { segments: this.skipSegments });
        } else {
          this.log('No skip segments found');
        }
        
        this.setState({ 
          isLoading: false,
          skipSegments: this.skipSegments
        });
      })
      .catch(error => {
        this.log.error('Error fetching skip segments:', error);
        this.setState({ isLoading: false, error: error.message });
        this.trigger('error', { error });
      });
  }
  
  /**
   * Initialize the UI components for the plugin
   */
  initializeUI() {
    // Create a custom skip button element instead of using Video.js Button component
    this.skipButton = document.createElement('button');
    this.skipButton.className = this.options.buttonClass;
    this.skipButton.textContent = this.options.buttonText.default;
    this.skipButton.style.display = 'none';
    
    // Add click handler to the button
    this.skipButton.addEventListener('click', () => {
      this.handleSkip();
    });
    
    // Add the button directly to the player's DOM element
    this.player.el().appendChild(this.skipButton);
    
    // Create notification element
    this.notification = this.createNotification();
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Set up time update handler to check for skip ranges
    this.on(this.player, 'timeupdate', this.checkForSkipRanges);
    
    // Handle player dispose
    this.on(this.player, 'dispose', () => {
      this.dispose();
    });
    
    // Handle fullscreen changes to reposition the button if needed
    this.on(this.player, 'fullscreenchange', () => {
      if (this.state.inSkipRange) {
        this.showSkipButton();
      }
    });
    
    // Get video duration when metadata is loaded
    this.on(this.player, 'loadedmetadata', () => {
      if (!this.options.episodeLength && this.player.duration() !== Infinity) {
        this.options.episodeLength = Math.floor(this.player.duration());
        this.log(`Episode length set to ${this.options.episodeLength} seconds`);
        
        // If we don't have skip segments yet but we have malId and episodeNumber,
        // fetch them now that we have the duration
        if (this.skipSegments.length === 0 && 
            this.options.malId && 
            this.options.episodeNumber) {
          this.fetchSkipSegments();
        }
      }
    });
  }
  
  /**
   * Create a notification element
   *
   * @return {Element} The notification DOM element
   */
  createNotification() {
    const notification = document.createElement('div');
    notification.className = this.options.notificationClass;
    notification.textContent = this.options.notificationText.default;
    notification.style.display = 'none';
    this.player.el().appendChild(notification);
    return notification;
  }
  
  /**
   * Check if the current time is within a skip range
   */
  checkForSkipRanges = () => {
    const currentTime = this.player.currentTime() + this.options.offset;
    
    // Don't check if we don't have any segments yet
    if (this.skipSegments.length === 0) {
      return;
    }
    
    // Find if we're in a skip range
    const inSkipRange = this.skipSegments.find(segment => 
      currentTime >= segment.start && currentTime < segment.end
    );
    
    // Update state based on skip range
    if (!!inSkipRange !== !!this.state.currentSkipRange || 
        (inSkipRange && this.state.currentSkipRange && 
         inSkipRange.type !== this.state.currentSkipRange.type)) {
      
      this.setState({
        inSkipRange: !!inSkipRange,
        currentSkipRange: inSkipRange || null
      });
      
      // Show or hide button based on state
      if (this.state.inSkipRange) {
        // Update button text based on the type of segment
        const type = inSkipRange.type || 'default';
        const buttonText = this.options.buttonText[type] || this.options.buttonText.default;
        this.skipButton.textContent = buttonText;
        
        // Auto-skip if enabled
        if (this.options.autoSkip) {
          this.handleSkip();
        } else {
          this.showSkipButton();
        }
      } else {
        this.hideSkipButton();
      }
    }
  }
  
  /**
   * Handle skipping the current range
   */
  handleSkip() {
    if (this.state.currentSkipRange) {
      // Skip to the end of the range
      this.player.currentTime(this.state.currentSkipRange.end - this.options.offset);
      
      // Get the type for notification text
      const type = this.state.currentSkipRange.type || 'default';
      const notificationText = this.options.notificationText[type] || this.options.notificationText.default;
      this.notification.textContent = notificationText;
      
      // Update state
      const skippedRange = this.state.currentSkipRange;
      this.setState({
        inSkipRange: false,
        currentSkipRange: null
      });
      
      this.hideSkipButton();
      this.showNotification();
      
      // Trigger skip event
      this.trigger('skip', {
        range: skippedRange
      });
    }
  }
  
  /**
   * Hide the skip button
   */
  hideSkipButton() {
    if (this.skipButton) {
      this.skipButton.style.display = 'none';
    }
  }
  
  /**
   * Show the skip button
   */
  showSkipButton() {
    if (this.skipButton) {
      this.skipButton.style.display = 'block';
    }
  }
  
  /**
   * Show the notification briefly
   */
  showNotification() {
    this.notification.style.display = 'block';
    setTimeout(() => {
      this.notification.style.display = 'none';
    }, 2000);
  }
  
  /**
   * Clean up the plugin when disposing
   */
  dispose() {
    // Make sure we clean up UI elements when disposing
    if (this.notification && this.notification.parentNode) {
      this.notification.parentNode.removeChild(this.notification);
    }
    
    if (this.skipButton && this.skipButton.parentNode) {
      this.skipButton.parentNode.removeChild(this.skipButton);
    }
    
    // Call the parent class's dispose function
    super.dispose();
    this.log('plugin disposed');
  }
}

// Define plugin defaults state
AniskipPlugin.defaultState = {
  isLoading: false,
  error: null,
  inSkipRange: false,
  currentSkipRange: null,
  skipSegments: []
};

// Define plugin version
AniskipPlugin.VERSION = '0.1.0';

// Register the plugin with Video.js
videojs.registerPlugin('aniskip', AniskipPlugin);

export default AniskipPlugin;