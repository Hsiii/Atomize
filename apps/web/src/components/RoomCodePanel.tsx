import { useRef, type ChangeEvent } from 'react';

import { uiText } from '../app-state';

type RoomCodePanelProps = {
    value: string;
    editable?: boolean;
    onChange?: (value: string) => void;
};

export function RoomCodePanel({
    value,
    editable = false,
    onChange,
}: RoomCodePanelProps) {
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
            <div className='room-code-visual' aria-hidden='true'>
                {roomCodePreview.map((character, index) => (
                    <div
                        key={`room-code-character-${index}`}
                        className={
                            value[index]
                                ? 'room-code-character filled'
                                : 'room-code-character'
                        }
                    >
                        {character}
                    </div>
                ))}
            </div>
            <input
                ref={inputRef}
                className='room-code-block-input'
                inputMode='numeric'
                pattern='[0-9]*'
                maxLength={4}
                value={value}
                onChange={handleInputChange}
                aria-label={uiText.enterCode}
            />
        </label>
    );
}
