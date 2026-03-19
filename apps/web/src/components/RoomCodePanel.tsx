import { useRef } from 'react';
import type { ChangeEvent, JSX } from 'react';

import { uiText } from '../app-state';

import './RoomCodePanel.css';

type RoomCodePanelProps = {
    value: string;
    editable?: boolean;
    onChange?: (value: string) => void;
};

export function RoomCodePanel({
    value,
    editable = false,
    onChange,
}: RoomCodePanelProps): JSX.Element {
    const inputRef = useRef<HTMLInputElement | null>(null);

    if (!editable) {
        return (
            <div className='code-panel waiting-code-panel room-code-panel'>
                <p className='label'>{uiText.roomCode}</p>
                <strong>{value || uiText.roomPlaceholder}</strong>
            </div>
        );
    }

    const roomCodePreview = Array.from(
        { length: 4 },
        (_, index) => value[index] ?? ''
    );

    const focusInput = () => {
        inputRef.current?.focus();
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event.target.value);
    };

    return (
        <label
            className='code-panel waiting-code-panel room-code-panel room-code-panel-editable'
            onClick={focusInput}
        >
            <p className='label'>{uiText.roomCode}</p>
            <div aria-hidden='true' className='room-code-visual'>
                {roomCodePreview.map((character, index) => (
                    <div
                        className={
                            value[index]
                                ? 'room-code-character filled'
                                : 'room-code-character'
                        }
                        key={`room-code-character-${index}`}
                    >
                        {character}
                    </div>
                ))}
            </div>
            <input
                aria-label={uiText.enterCode}
                className='room-code-block-input'
                inputMode='numeric'
                maxLength={4}
                onChange={handleInputChange}
                pattern='[0-9]*'
                ref={inputRef}
                value={value}
            />
        </label>
    );
}
