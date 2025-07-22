class PerformanceMonitor {
  private apiCallCount = 0;
  private apiCallTimestamps: number[] = [];
  private startTime = Date.now();

  // Track API call
  trackApiCall(endpoint: string) {
    this.apiCallCount++;
    this.apiCallTimestamps.push(Date.now());
    console.log(`📊 API Call #${this.apiCallCount}: ${endpoint}`);
    
    // Keep only last 100 timestamps to prevent memory leaks
    if (this.apiCallTimestamps.length > 100) {
      this.apiCallTimestamps = this.apiCallTimestamps.slice(-100);
    }
  }

  // Get API calls per minute
  getApiCallsPerMinute(): number {
    const oneMinuteAgo = Date.now() - 60000;
    const recentCalls = this.apiCallTimestamps.filter(timestamp => timestamp > oneMinuteAgo);
    return recentCalls.length;
  }

  // Get total API calls
  getTotalApiCalls(): number {
    return this.apiCallCount;
  }

  // Get app uptime in minutes
  getUptimeMinutes(): number {
    return Math.floor((Date.now() - this.startTime) / 60000);
  }

  // Log performance summary
  logPerformanceSummary() {
    const uptime = this.getUptimeMinutes();
    const callsPerMinute = this.getApiCallsPerMinute();
    const totalCalls = this.getTotalApiCalls();
    
    console.log('📈 Performance Summary:');
    console.log(`   Uptime: ${uptime} minutes`);
    console.log(`   Total API calls: ${totalCalls}`);
    console.log(`   API calls per minute: ${callsPerMinute}`);
    console.log(`   Average calls per minute: ${uptime > 0 ? (totalCalls / uptime).toFixed(2) : 0}`);
  }

  // Reset counters
  reset() {
    this.apiCallCount = 0;
    this.apiCallTimestamps = [];
    this.startTime = Date.now();
    console.log('🔄 Performance monitor reset');
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor; 