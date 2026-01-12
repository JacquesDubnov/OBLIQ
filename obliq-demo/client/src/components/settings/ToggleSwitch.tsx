import styled from 'styled-components';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const SwitchContainer = styled.button<{ $checked: boolean; $disabled?: boolean }>`
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background-color: ${({ $checked }) => ($checked ? '#00a884' : '#e0e0e0')};
  transition: background-color 0.2s ease;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  flex-shrink: 0;
`;

const SwitchCircle = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ $checked }) => ($checked ? '18px' : '2px')};
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: left 0.2s ease;
`;

export function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <SwitchContainer
      $checked={checked}
      $disabled={disabled}
      onClick={handleClick}
      type="button"
      role="switch"
      aria-checked={checked}
    >
      <SwitchCircle $checked={checked} />
    </SwitchContainer>
  );
}
