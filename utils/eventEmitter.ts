// EventEmitter simple pour React Native
class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (!this.events[event]) return;
    
    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, data?: any) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      callback(data);
    });
  }

  removeAllListeners(event?: string) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Instance globale pour l'application
export const prayerEventEmitter = new EventEmitter();

// Types d'événements
export const PRAYER_EVENTS = {
  PRAYER_ADDED: 'prayerAdded',
  PRAYER_DELETED: 'prayerDeleted',
} as const;
