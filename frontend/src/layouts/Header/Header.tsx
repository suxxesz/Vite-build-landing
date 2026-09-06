import DarkThemeSwitcher from '@/components/DarkThemeSwitcher'
import LoudBar from '@/components/LoudBar'
import NotificationBell from '@/components/NotificationBell'
import './Header.scss'
import HeaderNavigation from '@/sections/HeaderNavigation/HeaderNavigation'
 
export default ({ isSongRequired }: { isSongRequired: boolean }) => (
    <header className="header">
        {isSongRequired && <LoudBar />}
        {!isSongRequired && <HeaderNavigation onLeftSide={true}></HeaderNavigation>}
 
        <div className="header__right">
            {isSongRequired && <HeaderNavigation onLeftSide={false}></HeaderNavigation>}
            <NotificationBell />
            <DarkThemeSwitcher />
        </div>
    </header>
)
 