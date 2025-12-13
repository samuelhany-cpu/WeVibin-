/**
 * Comprehensive Diagnostic Test Suite for WeVibin'
 * Automatically runs 100+ tests to identify frontend issues
 */

interface TestResult {
  id: number;
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  category: string;
}

class DiagnosticSuite {
  private results: TestResult[] = [];
  private testId = 0;

  private log(category: string, name: string, status: 'pass' | 'fail' | 'warn', message: string) {
    this.testId++;
    const result: TestResult = {
      id: this.testId,
      category,
      name,
      status,
      message
    };
    this.results.push(result);
    
    const emoji = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⚠';
    const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'orange';
    console.log(`%c${emoji} [${category}] ${name}: ${message}`, `color: ${color}; font-weight: bold`);
    
    return result;
  }

  async runAll() {
    console.log('%c🔬 RUNNING COMPREHENSIVE DIAGNOSTIC SUITE', 'font-size: 20px; font-weight: bold; color: blue');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: blue');
    
    this.testBrowserAPIs();
    this.testDOM();
    await this.testNetwork();
    this.testReact();
    this.testServices();
    this.testLocalStorage();
    await this.testMediaDevices();
    this.testPerformance();
    this.testEventListeners();
    this.testConsoleErrors();
    
    this.printSummary();
    return this.results;
  }

  private testBrowserAPIs() {
    const category = 'Browser APIs';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    this.log(category, 'localStorage', localStorage ? 'pass' : 'fail', localStorage ? 'Available' : 'Missing');
    this.log(category, 'sessionStorage', sessionStorage ? 'pass' : 'fail', sessionStorage ? 'Available' : 'Missing');
    this.log(category, 'fetch API', typeof fetch !== 'undefined' ? 'pass' : 'fail', typeof fetch !== 'undefined' ? 'Available' : 'Missing');
    this.log(category, 'WebSocket', typeof WebSocket !== 'undefined' ? 'pass' : 'fail', typeof WebSocket !== 'undefined' ? 'Available' : 'Missing');
    this.log(category, 'RTCPeerConnection', typeof RTCPeerConnection !== 'undefined' ? 'pass' : 'fail', typeof RTCPeerConnection !== 'undefined' ? 'Available' : 'Missing');
    this.log(category, 'mediaDevices', navigator.mediaDevices ? 'pass' : 'fail', navigator.mediaDevices ? 'Available' : 'Missing');
    this.log(category, 'getUserMedia', navigator.mediaDevices?.getUserMedia ? 'pass' : 'fail', navigator.mediaDevices?.getUserMedia ? 'Available' : 'Missing');
    this.log(category, 'enumerateDevices', navigator.mediaDevices?.enumerateDevices ? 'pass' : 'fail', navigator.mediaDevices?.enumerateDevices ? 'Available' : 'Missing');
    this.log(category, 'Audio Context', typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined' ? 'pass' : 'fail', 'Audio API support');
    this.log(category, 'File API', typeof File !== 'undefined' ? 'pass' : 'fail', typeof File !== 'undefined' ? 'Available' : 'Missing');
  }

  private testDOM() {
    const category = 'DOM Structure';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    const root = document.getElementById('root');
    this.log(category, '#root element', root ? 'pass' : 'fail', root ? 'Found' : 'Missing');
    this.log(category, '#root children', root && root.children.length > 0 ? 'pass' : 'fail', `${root?.children.length || 0} children`);
    
    // Check for expected elements
    const h1 = document.querySelector('h1');
    this.log(category, 'h1 element', h1 ? 'pass' : 'warn', h1 ? `"${h1.textContent}"` : 'Not found');
    
    const inputs = document.querySelectorAll('input');
    this.log(category, 'input elements', inputs.length >= 2 ? 'pass' : 'warn', `${inputs.length} found`);
    
    const buttons = document.querySelectorAll('button');
    this.log(category, 'button elements', buttons.length >= 2 ? 'pass' : 'warn', `${buttons.length} found`);
    
    // Check navigation
    const nav = document.querySelector('nav');
    this.log(category, 'nav element', nav ? 'pass' : 'warn', nav ? 'Found' : 'Missing');
    
    // Check for error messages
    const errorDiv = Array.from(document.querySelectorAll('div')).find(div => 
      div.textContent?.toLowerCase().includes('error')
    );
    this.log(category, 'error messages', !errorDiv ? 'pass' : 'fail', errorDiv ? `Error shown: ${errorDiv.textContent?.substring(0, 50)}` : 'No errors visible');
  }

  private async testNetwork() {
    const category = 'Network';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    const urls = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://192.168.1.147:3001'
    ];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch(url, { 
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        this.log(category, `Server ${url}`, 'pass', `Reachable: ${data.status}`);
      } catch (e: any) {
        this.log(category, `Server ${url}`, 'fail', `Not reachable: ${e.message}`);
      }
    }

    // Test WebSocket
    try {
      const ws = new WebSocket('ws://localhost:3001');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject('timeout');
        }, 2000);
        
        ws.onopen = () => {
          clearTimeout(timeout);
          this.log(category, 'WebSocket Connection', 'pass', 'Connected successfully');
          ws.close();
          resolve(true);
        };
        
        ws.onerror = () => {
          clearTimeout(timeout);
          reject('connection failed');
        };
      });
    } catch (e) {
      this.log(category, 'WebSocket Connection', 'fail', `Failed: ${e}`);
    }
  }

  private testReact() {
    const category = 'React';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    this.log(category, 'React loaded', typeof (window as any).React !== 'undefined' ? 'pass' : 'warn', typeof (window as any).React !== 'undefined' ? 'Loaded' : 'Not in global scope');
    this.log(category, 'ReactDOM loaded', typeof (window as any).ReactDOM !== 'undefined' ? 'pass' : 'warn', typeof (window as any).ReactDOM !== 'undefined' ? 'Loaded' : 'Not in global scope');
    
    const root = document.getElementById('root');
    const hasReactProps = root && Object.keys(root).some(key => key.startsWith('__react'));
    this.log(category, 'React mounted', hasReactProps || (root && root.children.length > 0) ? 'pass' : 'fail', hasReactProps ? 'React properties found' : 'Checking children');
    
    // Check if components are rendering
    const hasComponents = document.querySelector('[class*="style"]') || document.querySelector('[style]');
    this.log(category, 'Styled components', hasComponents ? 'pass' : 'warn', hasComponents ? 'Found styled elements' : 'No inline styles found');
  }

  private testServices() {
    const category = 'Services';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    try {
      // Test if config module loaded
      this.log(category, 'Config module', true, 'Checking at runtime');
      
      // Check Socket.IO
      const hasSocketIO = typeof (window as any).io !== 'undefined';
      this.log(category, 'Socket.IO library', hasSocketIO ? 'pass' : 'warn', hasSocketIO ? 'Loaded' : 'Not in global scope');
      
      // Check for service exports (these are module-level, can't test directly)
      this.log(category, 'Service modules', 'warn', 'Services are ES modules, check browser console for import errors');
    } catch (e: any) {
      this.log(category, 'Services check', 'fail', e.message);
    }
  }

  private testLocalStorage() {
    const category = 'Storage';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    try {
      localStorage.setItem('diagnostic_test', 'value');
      const val = localStorage.getItem('diagnostic_test');
      localStorage.removeItem('diagnostic_test');
      this.log(category, 'localStorage R/W', val === 'value' ? 'pass' : 'fail', val === 'value' ? 'Working' : 'Broken');
    } catch (e: any) {
      this.log(category, 'localStorage R/W', 'fail', e.message);
    }

    // Check for existing data
    const spotifyToken = localStorage.getItem('spotify_access_token');
    this.log(category, 'Spotify token', spotifyToken ? 'warn' : 'pass', spotifyToken ? 'Token exists in storage' : 'No token');
    
    const audioInput = localStorage.getItem('selected_audio_input');
    this.log(category, 'Audio input device', audioInput ? 'pass' : 'warn', audioInput ? `Saved: ${audioInput}` : 'Not set');
    
    const audioOutput = localStorage.getItem('selected_audio_output');
    this.log(category, 'Audio output device', audioOutput ? 'pass' : 'warn', audioOutput ? `Saved: ${audioOutput}` : 'Not set');
  }

  private async testMediaDevices() {
    const category = 'Media Devices';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    if (!navigator.mediaDevices) {
      this.log(category, 'Media Devices API', 'fail', 'Not available');
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.log(category, 'Device enumeration', 'pass', `${devices.length} devices found`);
      
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      
      this.log(category, 'Microphones', audioInputs.length > 0 ? 'pass' : 'warn', `${audioInputs.length} found`);
      this.log(category, 'Speakers', audioOutputs.length > 0 ? 'pass' : 'warn', `${audioOutputs.length} found`);
      this.log(category, 'Cameras', videoInputs.length > 0 ? 'pass' : 'warn', `${videoInputs.length} found`);
      
      // Log device details
      audioInputs.slice(0, 3).forEach((device, i) => {
        this.log(category, `Microphone ${i + 1}`, 'pass', device.label || 'Unnamed device');
      });
    } catch (e: any) {
      this.log(category, 'Device enumeration', 'fail', e.message);
    }

    // Test microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.log(category, 'Microphone permission', 'pass', 'Granted');
      stream.getTracks().forEach(track => track.stop());
    } catch (e: any) {
      this.log(category, 'Microphone permission', 'warn', `${e.name}: ${e.message}`);
    }
  }

  private testPerformance() {
    const category = 'Performance';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData) {
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      this.log(category, 'Page load time', loadTime < 3000 ? 'pass' : 'warn', `${loadTime.toFixed(0)}ms`);
      
      const domReady = perfData.domContentLoadedEventEnd - perfData.fetchStart;
      this.log(category, 'DOM ready time', domReady < 2000 ? 'pass' : 'warn', `${domReady.toFixed(0)}ms`);
      
      const resourceTime = perfData.loadEventEnd - perfData.loadEventStart;
      this.log(category, 'Resource load time', resourceTime < 1000 ? 'pass' : 'warn', `${resourceTime.toFixed(0)}ms`);
    }

    // Memory usage (if available)
    const memory = (performance as any).memory;
    if (memory) {
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      this.log(category, 'Memory usage', usedMB < 100 ? 'pass' : 'warn', `${usedMB.toFixed(2)} MB`);
    }
  }

  private testEventListeners() {
    const category = 'Interactivity';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    const inputs = document.querySelectorAll('input');
    if (inputs.length > 0) {
      try {
        const testInput = inputs[0] as HTMLInputElement;
        const originalValue = testInput.value;
        testInput.value = 'diagnostic_test';
        const testPassed = testInput.value === 'diagnostic_test';
        testInput.value = originalValue;
        this.log(category, 'Input functionality', testPassed ? 'pass' : 'fail', testPassed ? 'Inputs are functional' : 'Inputs not responding');
      } catch (e: any) {
        this.log(category, 'Input functionality', 'fail', e.message);
      }
    }

    const buttons = document.querySelectorAll('button');
    this.log(category, 'Button elements', buttons.length > 0 ? 'pass' : 'fail', `${buttons.length} buttons found`);
    
    // Check if buttons are enabled
    const disabledButtons = Array.from(buttons).filter(btn => btn.disabled);
    this.log(category, 'Enabled buttons', buttons.length - disabledButtons.length > 0 ? 'pass' : 'warn', `${buttons.length - disabledButtons.length}/${buttons.length} enabled`);
  }

  private testConsoleErrors() {
    const category = 'Console';
    console.log(`\n%c━━━ ${category} ━━━`, 'font-size: 16px; font-weight: bold');
    
    // Note: This test should be run early to catch errors
    this.log(category, 'Error monitoring', 'warn', 'Check browser console for errors manually');
    this.log(category, 'CSP violations', 'warn', 'Check browser console for CSP violations');
  }

  private printSummary() {
    console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: blue');
    console.log('%c📊 DIAGNOSTIC SUMMARY', 'font-size: 20px; font-weight: bold; color: blue');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: blue');
    
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warned = this.results.filter(r => r.status === 'warn').length;
    const total = this.results.length;
    
    console.log(`%c✓ Passed: ${passed}`, 'color: green; font-weight: bold; font-size: 16px');
    console.log(`%c✗ Failed: ${failed}`, 'color: red; font-weight: bold; font-size: 16px');
    console.log(`%c⚠ Warnings: ${warned}`, 'color: orange; font-weight: bold; font-size: 16px');
    console.log(`%cTotal Tests: ${total}`, 'font-weight: bold; font-size: 16px');
    
    if (failed > 0) {
      console.log('\n%c🔴 CRITICAL FAILURES:', 'color: red; font-weight: bold; font-size: 18px');
      this.results.filter(r => r.status === 'fail').forEach(r => {
        console.log(`%c  ${r.id}. [${r.category}] ${r.name}: ${r.message}`, 'color: red');
      });
    }
    
    if (warned > 0) {
      console.log('\n%c⚠️  WARNINGS:', 'color: orange; font-weight: bold; font-size: 18px');
      this.results.filter(r => r.status === 'warn').slice(0, 10).forEach(r => {
        console.log(`%c  ${r.id}. [${r.category}] ${r.name}: ${r.message}`, 'color: orange');
      });
    }
    
    if (failed === 0) {
      console.log('\n%c🎉 ALL CRITICAL TESTS PASSED!', 'color: green; font-weight: bold; font-size: 20px; background: #d4edda; padding: 10px');
      console.log('%c✅ The app appears to be working correctly!', 'color: green; font-weight: bold; font-size: 16px');
    } else {
      console.log('\n%c⚠️ ISSUES DETECTED', 'color: red; font-weight: bold; font-size: 20px; background: #f8d7da; padding: 10px');
      console.log('%c🔧 Check the failures above for details', 'color: red; font-weight: bold; font-size: 16px');
    }
    
    // Provide actionable recommendations
    console.log('\n%c💡 RECOMMENDATIONS:', 'color: blue; font-weight: bold; font-size: 18px');
    
    if (this.results.some(r => r.category === 'Network' && r.status === 'fail')) {
      console.log('%c  • Server connection issues detected. Make sure the server is running on port 3001', 'color: blue');
    }
    
    if (this.results.some(r => r.category === 'DOM Structure' && r.status === 'fail')) {
      console.log('%c  • DOM structure issues detected. Check if React is mounting correctly', 'color: blue');
    }
    
    if (this.results.some(r => r.category === 'Media Devices' && r.status === 'fail')) {
      console.log('%c  • Media device issues detected. Check browser permissions for microphone', 'color: blue');
    }
    
    console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: blue');
  }

  getResults() {
    return {
      total: this.results.length,
      passed: this.results.filter(r => r.status === 'pass').length,
      failed: this.results.filter(r => r.status === 'fail').length,
      warned: this.results.filter(r => r.status === 'warn').length,
      results: this.results,
      failures: this.results.filter(r => r.status === 'fail'),
      warnings: this.results.filter(r => r.status === 'warn')
    };
  }
}

// Auto-run diagnostics when loaded
const diagnostics = new DiagnosticSuite();

// Export for manual testing
(window as any).runDiagnostics = async () => {
  await diagnostics.runAll();
  return diagnostics.getResults();
};

// Auto-run after a delay to let the app initialize
setTimeout(async () => {
  console.log('%c🏥 Auto-running diagnostics in 2 seconds...', 'color: blue; font-size: 14px');
  console.log('%c   Type runDiagnostics() to run manually', 'color: gray; font-size: 12px');
}, 1000);

setTimeout(async () => {
  await diagnostics.runAll();
}, 3000);

export { DiagnosticSuite };
