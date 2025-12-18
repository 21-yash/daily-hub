import { batchService } from './api';

const QUEUE_KEY = 'offline_sync_queue';
const BATCH_SIZE = 10; // Process max 10 operations per batch
const BATCH_DELAY = 1000; // Wait 1 second to collect more operations before sending

class SyncQueue {
  constructor() {
    this.queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    this.isSyncing = false;
    this.batchTimer = null;
    
    // Listen for online status
    window.addEventListener('online', () => {
      console.log('📡 Back online, processing queue...');
      this.processQueue();
    });
  }

  saveQueue() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
  }

  add(type, action, payload, tempId = null) {

    if (action === 'delete' && payload.id && payload.id.startsWith('temp_')) {
      console.log('⚠️ Skipping delete for temp ID:', payload.id);
      return;
    }
    
    const item = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type,
      action,
      payload,
      tempId,
      timestamp: Date.now(),
      retries: 0
    };
    
    this.queue.push(item);
    this.saveQueue();
    
    console.log(`📝 Added to queue: ${type} ${action}`, this.queue.length, 'items total');
    
    // Try to sync immediately if online (with slight delay to batch)
    if (navigator.onLine) {
      this.scheduleBatchSync();
    }
  }

  scheduleBatchSync() {
    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    // Schedule a batch sync after delay (to collect more operations)
    this.batchTimer = setTimeout(() => {
      this.processQueue();
    }, BATCH_DELAY);
  }

  async processQueue() {
    if (this.isSyncing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isSyncing = true;
    console.log(`🔄 Processing sync queue... ${this.queue.length} items`);

    try {
      // Process in batches
      while (this.queue.length > 0 && navigator.onLine) {
        const batch = this.queue.slice(0, BATCH_SIZE);
        
        console.log(`📦 Sending batch of ${batch.length} operations...`);
        
        const operations = batch.map(item => ({
          type: item.type,
          action: item.action,
          payload: item.payload,
          tempId: item.tempId
        }));

        try {
          const response = await batchService.sync(operations);
          const { results, errors } = response.data;

          console.log(`✅ Batch complete: ${results.length} succeeded, ${errors.length} failed`);

          // Remove successful operations from queue
          const successfulIds = new Set(
            results.map((r, idx) => batch[idx].id)
          );

          this.queue = this.queue.filter(item => !successfulIds.has(item.id));
          this.saveQueue();

          // Handle errors (retry logic)
          if (errors.length > 0) {
            console.warn('⚠️ Some operations failed:', errors);
            
            // Increment retry count for failed items
            errors.forEach(err => {
              const failedItem = batch[err.index];
              if (failedItem) {
                const queueItem = this.queue.find(q => q.id === failedItem.id);
                if (queueItem) {
                  queueItem.retries = (queueItem.retries || 0) + 1;
                  
                  // Remove if too many retries (>3)
                  if (queueItem.retries > 3) {
                    console.error('❌ Dropping failed item after 3 retries:', queueItem);
                    this.queue = this.queue.filter(q => q.id !== queueItem.id);
                  }
                }
              }
            });
            this.saveQueue();
          }

          // Dispatch event for UI updates (optional)
          window.dispatchEvent(new CustomEvent('syncComplete', {
            detail: { results, errors }
          }));

        } catch (error) {
          console.error('❌ Batch sync failed:', error);
          
          // If network error, stop processing
          if (!navigator.onLine || error.code === 'ERR_NETWORK') {
            console.log('📴 Network error, stopping sync');
            break;
          }
          
          // For other errors, increment retry count
          batch.forEach(item => {
            const queueItem = this.queue.find(q => q.id === item.id);
            if (queueItem) {
              queueItem.retries = (queueItem.retries || 0) + 1;
              if (queueItem.retries > 3) {
                this.queue = this.queue.filter(q => q.id !== queueItem.id);
              }
            }
          });
          this.saveQueue();
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (this.queue.length === 0) {
        console.log('✅ Sync queue empty');
      } else {
        console.log(`⏸️ Sync paused, ${this.queue.length} items remaining`);
      }

    } finally {
      this.isSyncing = false;
    }
  }

  removeFromQueue(id) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }
  
  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
  
  getQueue() {
    return this.queue;
  }
  
  getQueueSize() {
    return this.queue.length;
  }
}

export const syncQueue = new SyncQueue();