import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useMediaDevices } from '../hooks/useMediaDevices';

interface DeviceDropdownProps {
  type: 'video' | 'audio';
  enabled: boolean;
  selectedDeviceId: string | null;
  onToggle: (enabled: boolean) => void;
  onDeviceSelect: (deviceId: string) => void;
}

const DeviceDropdown: React.FC<DeviceDropdownProps> = (props) => {
  const { type, enabled, selectedDeviceId, onToggle, onDeviceSelect } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const kind = type === 'video' ? 'videoinput' : 'audioinput';
  const { devices, error, loading } = useMediaDevices(kind);

  // Icons based on type and enabled state
  const enabledIcon = type === 'video' ? faVideo : faMicrophone;
  const disabledIcon = type === 'video' ? faVideoSlash : faMicrophoneSlash;
  const currentIcon = enabled ? enabledIcon : disabledIcon;
  const label = type === 'video' ? 'Webcam' : 'Mic';

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

  const handleDeviceClick = (deviceId: string) => {
    onDeviceSelect(deviceId);
    setIsOpen(false);
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(!enabled);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        {/* Icon button - toggles enabled/disabled */}
        <button
          onClick={handleIconClick}
          className={`device-icon-button ${enabled ? 'active' : ''}`}
          title={enabled ? `Disable ${label}` : `Enable ${label}`}
        >
          <FontAwesomeIcon icon={currentIcon} className="w-5 h-5" />
        </button>

        {/* Dropdown button - selects device */}
        <button
          onClick={handleDropdownClick}
          className={`device-dropdown-button ${enabled ? 'active' : ''} ${isOpen ? 'open' : ''}`}
          title={`Select ${label}`}
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="dropdown">
          <div className="py-2">
            {loading && (
              <div className="px-4 py-2 text-dark-text-muted text-sm">Loading devices...</div>
            )}

            {error && (
              <div className="px-4 py-2 text-danger text-sm">Error: {error}</div>
            )}

            {!loading && !error && devices.length === 0 && (
              <div className="px-4 py-2 text-dark-text-muted text-sm">No {label.toLowerCase()} devices found</div>
            )}

            {!loading && !error && devices.length > 0 && (
              <>
                <div className="px-4 py-1 text-xs text-dark-text-muted uppercase tracking-wide">
                  Select {label}
                </div>
                {devices.map((device, index) => {
                  const isSelected = selectedDeviceId === device.deviceId;
                  const deviceLabel = device.label || `${label} ${index + 1}`;
                  return (
                    <div
                      key={device.deviceId}
                      onClick={() => handleDeviceClick(device.deviceId)}
                      className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="flex items-center space-x-2">
                        {isSelected && (
                          <svg className="w-4 h-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`flex-1 truncate ${!isSelected ? 'ml-6' : ''}`}>{deviceLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceDropdown;
