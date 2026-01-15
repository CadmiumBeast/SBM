import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
            <div className="flex aspect-square items-center justify-center rounded-md  text-sidebar-primary-foreground">
                <AppLogoIcon className="fill-current text-white dark:text-black" />
            </div>
            
    );
}