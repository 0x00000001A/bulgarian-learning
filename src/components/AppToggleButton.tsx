import React, {useCallback} from 'react';
import {clsx} from "../utils.ts";

type AppToggleButtonProps<T> = {
  label: string
  value: T
  selected: boolean
  disabled: boolean
  onClick: (value: T, event: React.MouseEvent) => void
}

const AppToggleButton = <T, >({label, value, selected, disabled, onClick}: AppToggleButtonProps<T>) => {
  const handleButtonClick = useCallback((event: React.MouseEvent) => {
    onClick(value, event)
  }, [onClick, value])

  return (
    <button
      className={clsx('quizButton', selected && 'quizButtonSelected')}
      disabled={disabled}
      onClick={handleButtonClick}
    >
      {label}
    </button>
  );
};

export default AppToggleButton;
