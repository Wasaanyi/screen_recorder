import React, { useState, useRef, useEffect } from 'react';
import { useMediaDevices } from '../hooks/useMediaDevices';

interface DeviceDropdownProps {
  type: 'video' | 'audio';
  enabled: boolean;
  selectedDeviceId: string | null;
  onToggle: (enabled: boolean) => void;
  onDeviceSelect: (deviceId: string) => void;
  icon: string;
  label: string;
}

const DeviceDropdown: React.FC<DeviceDropdownProps> = (props) => {
  const { type, enabled, selectedDeviceId, onToggle, onDeviceSelect, icon, label } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const kind = type === 'video' ? 'videoinput' : 'audioinput';
  const { devices, error, loading } = useMediaDevices(kind);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(!enabled);
  };

  const handleDeviceClick = (deviceId: string) => {
    onDeviceSelect(deviceId);
    setIsOpen(false);
  };

  const buttonClass = 'toolbar-button flex items-center space-x-2 ' + (enabled ? 'active' : '');
  const arrowClass = 'w-4 h-4 transition-transform ' + (isOpen ? 'rotate-180' : '');

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={buttonClass}>
        <span>{icon}</span>
        <span>{label}</span>
        <svg className={arrowClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown">
          <div className="px-4 py-3 border-b border-dark-border">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={handleToggleClick}
                className="w-4 h-4 rounded border-dark-border bg-dark-hover checked:bg-primary focus:ring-primary"
              />
              <span className="text-dark-text font-medium">Enable {label}</span>
            </label>
          </div>

          {enabled && (
            <div className="py-2">
              {loading && (
                <div className="px-4 py-2 text-dark-text-muted text-sm">Loading devices...</div>
              )}

              {error && (
                <div className="px-4 py-2 text-danger text-sm">Error: {error}</div>
              )}

              {!loading && !error && devices.length === 0 && (
                <div className="px-4 py-2 text-dark-text-muted text-sm">No devices found</div>
              )}

              {!loading && !error && devices.length > 0 && (
                <>
                  <div className="px-4 py-1 text-xs text-dark-text-muted uppercase tracking-wide">Select Device</div>
                  {devices.map(device => {
                    const itemClass = 'dropdown-item ' + (selectedDeviceId === device.deviceId ? 'selected' : '');
                    const deviceLabel = device.label || (label + ' ' + (devices.indexOf(device) + 1));
                    return (
                      <div key={device.deviceId} onClick={() => handleDeviceClick(device.deviceId)} className={itemClass}>
                        <div className="flex items-center space-x-2">
                          {selectedDeviceId === device.deviceId && (
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="flex-1 truncate">{deviceLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceDropdown;
