# F. ELON - Firefox Extension

Originally created to reduce Elon Musk-related content on Reddit, F. ELON has evolved into a versatile keyword-based content filter for Reddit. The extension allows you to specify and filter out posts containing any keywords you want to see less of, working seamlessly on both old and new Reddit interfaces.

## Features

- Smart keyword-based post filtering that works across old.reddit.com and www.reddit.com
- Customizable filtering system - add or remove any keywords you want to filter
- Default configuration focused on Elon Musk-related content
- Real-time content filtering with automatic updates as you scroll
- Modern, accessible UI for easy keyword management
- Efficient performance with debounced filtering and optimized DOM operations
- Maintains Reddit's layout integrity while hiding filtered posts

## Installation

1. Clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select `manifest.json`

## Development

### Project Structure

```
F.ELON/
├── src/
│   ├── background/
│   │   └── background.js    # Background script for extension-wide functionality
│   ├── content/
│   │   └── content.js       # Content script for Reddit page manipulation
│   ├── popup/
│   │   ├── popup.html      # Extension popup interface
│   │   └── popup.js        # Popup functionality
│   ├── styles/
│   │   └── popup.css       # Styles for the popup interface
│   └── icons/              # Extension icons
├── manifest.json           # Extension manifest
├── LICENSE                # License information
└── README.md             # This file
```

### Development Setup

1. Install a modern version of Firefox
2. Enable extension debugging in Firefox
3. Use the "Load Temporary Add-on" feature for testing

### Building for Production

1. Zip the contents of the extension directory
2. Submit to Firefox Add-ons for review

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Updates

### Version 1.1
- Added support for www.reddit.com (new Reddit)
- Improved performance with debouncing
- Enhanced accessibility
- Modern UI redesign
- Restructured codebase for better maintainability

### Version 1.0
- Initial release
- Support for old.reddit.com 