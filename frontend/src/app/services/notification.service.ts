import { Injectable } from '@angular/core';

type ToastType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private containerId = 'app-toast-container';

  show(message: string, type: ToastType = 'info', timeout = 4500) {
    try {
      let container = document.getElementById(this.containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = this.containerId;
        container.style.position = 'fixed';
        container.style.top = '16px';
        container.style.left = '16px';
        container.style.zIndex = '99999';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.innerText = message;
      toast.style.background = type === 'success' ? '#2f855a' : type === 'error' ? '#d53f3f' : '#2b6cb0';
      toast.style.color = '#fff';
      toast.style.padding = '8px 12px';
      toast.style.marginTop = '8px';
      toast.style.borderRadius = '6px';
      toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
      toast.style.fontSize = '14px';
      toast.style.maxWidth = '360px';
      toast.style.direction = 'rtl';

      container.appendChild(toast);

      const remove = () => {
        try {
          toast.style.transition = 'opacity 0.25s ease';
          toast.style.opacity = '0';
          setTimeout(() => container?.removeChild(toast), 300);
        } catch (e) {
          // ignore
        }
      };

      setTimeout(remove, timeout);

      // click to dismiss
      toast.addEventListener('click', remove);
    } catch (e) {
      // non-fatal
      console.error('NotificationService error', e);
    }
  }

  success(message: string, timeout = 3500) {
    this.show(message, 'success', timeout);
  }

  error(message: string, timeout = 6000) {
    this.show(message, 'error', timeout);
  }

  info(message: string, timeout = 3500) {
    this.show(message, 'info', timeout);
  }
}
