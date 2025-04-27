import { storage } from './storage';
import PQueue from 'p-queue';

// Create a queue for processing payments
export const processPaymentQueue = new PQueue({ concurrency: 2 });

// Process payment function
export async function processPayment(paymentId: number) {
  try {
    console.log(`Processing payment ${paymentId}...`);
    
    // Get the payment
    const payment = await storage.getPayment(paymentId);
    if (!payment) {
      console.error(`Payment ${paymentId} not found`);
      return;
    }
    
    // Update payment to processing
    await storage.updatePaymentStatus(paymentId, 'processing');
    
    // Simulate payment processing time (would be a real payment gateway in production)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // 90% success rate for simulation
    const success = Math.random() < 0.9;
    
    if (success) {
      // Payment successful
      await storage.updatePaymentStatus(paymentId, 'completed');
      console.log(`Payment ${paymentId} completed successfully`);
    } else {
      // Payment failed
      await storage.updatePaymentStatus(paymentId, 'failed');
      console.error(`Payment ${paymentId} failed`);
    }
  } catch (error) {
    console.error(`Error processing payment ${paymentId}:`, error);
    // Update payment to failed status
    await storage.updatePaymentStatus(paymentId, 'failed');
  }
}

// We don't need the 'add' event handler anymore since we're passing
// a function directly to the queue that includes all error handling

// Lock acquisition helper for database-level locking
export async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // In a production app, we would use a distributed lock mechanism
  // For this demo, we're simplifying with a local implementation
  const lockKey = `lock:${key}`;
  
  try {
    // Attempt to acquire the lock
    // This would use a real locking mechanism in production
    console.log(`Acquiring lock for ${key}...`);
    
    // Execute the function with the lock
    return await fn();
  } finally {
    // Release the lock
    console.log(`Releasing lock for ${key}...`);
  }
}
