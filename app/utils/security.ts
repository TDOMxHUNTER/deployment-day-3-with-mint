
// Security utilities to prevent dev tools access and protect the application
export class SecurityManager {
  private static instance: SecurityManager;
  private isSecurityEnabled = true;
  
  private constructor() {
    this.initializeSecurity();
  }
  
  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }
  
  private initializeSecurity() {
    if (typeof window === 'undefined') return;
    
    // Obfuscate global variables
    this.obfuscateGlobals();
    
    // Disable text selection and copying
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    });
    
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (Dev Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+K (Console in Firefox)
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
    });
    
    // Detect dev tools opening
    this.detectDevTools();
    
    // Clear console less frequently
    setInterval(() => {
      try {
        console.clear();
      } catch(e) {}
    }, 5000);
    
    // Override console methods
    this.overrideConsole();
    
    // Detect source viewing attempts
    this.detectSourceViewing();
    
    // Block extensions and prevent bypass techniques
    this.blockExtensions();
    this.preventBypass();
  }
  
  private detectDevTools() {
    // Enhanced dev tools detection
    const threshold = 160;
    let devtools = {
      open: false,
      warningShown: false
    };
    
    // Multiple detection methods
    const checkMethods = [
      // Size-based detection
      () => {
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthDiff = window.outerWidth - window.innerWidth;
        return (heightDiff > threshold && heightDiff < 800) || (widthDiff > threshold && widthDiff < 800);
      },
      
      // Console-based detection
      () => {
        let devtoolsOpen = false;
        const element = new Image();
        Object.defineProperty(element, 'id', {
          get: function() {
            devtoolsOpen = true;
            return 'devtools-detector';
          }
        });
        console.log('%c', element);
        return devtoolsOpen;
      },
      
      // Performance-based detection
      () => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        return (end - start) > 100;
      }
    ];
    
    setInterval(() => {
      const isDetected = checkMethods.some(method => {
        try {
          return method();
        } catch(e) {
          return false;
        }
      });
      
      if (isDetected && !devtools.open && !devtools.warningShown) {
        devtools.open = true;
        devtools.warningShown = true;
        this.showDevToolsWarning();
        this.triggerSecurityAction();
      } else if (!isDetected) {
        devtools.open = false;
        setTimeout(() => {
          devtools.warningShown = false;
        }, 3000);
      }
    }, 1000);
  }
  
  private triggerSecurityAction() {
    // Blur the page content
    document.body.style.filter = 'blur(5px)';
    document.body.style.pointerEvents = 'none';
    
    // Show overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); z-index: 999999;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 24px; text-align: center;
    `;
    overlay.innerHTML = `
      <div>
        <h2>🔒 Access Restricted</h2>
        <p>Developer tools detected. Please close them to continue.</p>
        <button onclick="location.reload()" style="
          margin-top: 20px; padding: 10px 20px; background: #007bff; 
          color: white; border: none; border-radius: 5px; cursor: pointer;
        ">Reload Page</button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Remove blur and overlay after 10 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.remove();
      }
      document.body.style.filter = '';
      document.body.style.pointerEvents = '';
    }, 10000);
  }
  
  private showDevToolsWarning() {
    // Show a non-blocking warning instead of blocking access
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed; top: 20px; right: 20px; width: 300px; 
      background: rgba(255, 0, 0, 0.9); color: white; padding: 15px; 
      border-radius: 8px; z-index: 999999; font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    warning.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>⚠️ Developer tools detected</span>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
      </div>
    `;
    
    document.body.appendChild(warning);
    
    // Auto-remove warning after 5 seconds
    setTimeout(() => {
      if (warning.parentNode) {
        warning.remove();
      }
    }, 5000);
  }
  
  private overrideConsole() {
    // Override console in all environments for better protection
    const noop = () => {};
    const originalLog = console.log;
    
    // Preserve some console functionality for debugging if needed
    Object.defineProperty(window, 'console', {
      value: {
        ...console,
        log: noop,
        warn: noop,
        error: noop,
        info: noop,
        debug: noop,
        clear: noop,
        trace: noop,
        assert: noop,
        count: noop,
        dir: noop,
        dirxml: noop,
        group: noop,
        groupCollapsed: noop,
        groupEnd: noop,
        profile: noop,
        profileEnd: noop,
        table: noop,
        time: noop,
        timeEnd: noop,
        timeStamp: noop
      },
      writable: false,
      configurable: false
    });
  }
  
  // Input sanitization
  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/script/gi, '')
      .trim();
  }
  
  // XSS protection
  public escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Rate limiting for API calls
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  public checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  private obfuscateGlobals() {
    // Hide common debugging tools
    try {
      delete (window as any).React;
      delete (window as any).ReactDOM;
      delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      delete (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
      delete (window as any).__REDUX_DEVTOOLS_EXTENSION__;
      
      // Override toString to hide function sources
      Function.prototype.toString = function() {
        return `function ${this.name}() { [native code] }`;
      };
      
      // Block common debugging objects
      Object.defineProperty(window, 'chrome', { value: undefined, writable: false });
      Object.defineProperty(window, 'safari', { value: undefined, writable: false });
      
      // Prevent iframe injection
      if (window.top !== window.self) {
        window.top.location = window.self.location;
      }
      
    } catch(e) {
      // Silently fail
    }
  }
  
  // Add method to detect and block browser extensions
  private blockExtensions() {
    // Check for common extension patterns
    const extensionPatterns = [
      'chrome-extension://',
      'moz-extension://',
      'webkit-extension://',
      'ms-browser-extension://'
    ];
    
    // Block extension access attempts
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0]?.toString() || '';
      if (extensionPatterns.some(pattern => url.includes(pattern))) {
        return Promise.reject(new Error('Extension access blocked'));
      }
      return originalFetch.apply(this, args);
    };
  }
  
  // Prevent common bypass techniques
  private preventBypass() {
    // Block common bypass methods
    const blockedProperties = ['__proto__', 'constructor', 'prototype'];
    
    blockedProperties.forEach(prop => {
      try {
        Object.defineProperty(Object.prototype, prop, {
          get() { return undefined; },
          set() { return false; },
          configurable: false
        });
      } catch(e) {}
    });
    
    // Prevent eval and Function constructor
    window.eval = function() { throw new Error('eval() is disabled'); };
    window.Function = function() { throw new Error('Function constructor is disabled'); };
  }
  
  // Detect if source is being viewed
  public detectSourceViewing() {
    // Check for view-source protocol
    if (window.location.protocol === 'view-source:') {
      window.location.href = 'about:blank';
      return;
    }
    
    // Detect if user is trying to view source through other means
    document.addEventListener('keydown', (e) => {
      // Block view source attempts
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        this.showSourceAccessWarning();
        return false;
      }
    });
  }
  
  private showSourceAccessWarning() {
    alert('Source code viewing is restricted for this application.');
  }
}

// Initialize security immediately
if (typeof window !== 'undefined') {
  SecurityManager.getInstance();
}
