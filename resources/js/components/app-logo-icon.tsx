import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img
            src="/images/Logo_original_no_bg.png"
            alt="App Logo"
            {...props}
        />
    );
}
