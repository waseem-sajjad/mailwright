import { useId } from 'react';

type CheckBoxProps = React.ComponentPropsWithRef<'input'>;

export const CheckBox: React.FC<CheckBoxProps> = (props) => {
    const id = useId();

    return (
        <label
            className="relative inline-block h-5 w-10"
            aria-label="checkbox"
            htmlFor={id}
        >
            <input
                className="peer size-0 opacity-0"
                type="checkbox"
                id={id}
                {...props}
            />
            <span className="absolute top-0 right-0 bottom-0 left-0 cursor-pointer rounded-[20px] bg-gray transition duration-300 peer-checked:bg-blue-500 before:absolute before:bottom-[3.5px] before:left-[3px] before:size-[15px] before:rounded-[50%] before:bg-white before:transition before:duration-300 before:content-[''] peer-checked:before:transform-[translateX(20px)]" />
        </label>
    );
};
