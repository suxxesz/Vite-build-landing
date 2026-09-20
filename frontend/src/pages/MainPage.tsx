//@ts-ignore
import React from 'react'
import Main from '@/layouts/Main'
import Header from '@/layouts/Header'
import AudioPopup from '@/layouts/AudioPopup'
import song1 from '@/assets/sounds/song1.mp3'
import song1Image from '@/assets/sounds/song1Image.jpg'
import song2 from '@/assets/sounds/song2.mp3'
import song2Image from '@/assets/sounds/song2Image.jpg'
import song3 from '@/assets/sounds/song3.mp3'
import song3Image from '@/assets/sounds/song3Image.jpg'
import song4 from '@/assets/sounds/song4.mp3'
import song4Image from '@/assets/sounds/song4Image.jpg'
import song5 from '@/assets/sounds/song5.mp3'
import song5Image from '@/assets/sounds/song5Image.jpg'
import AudioProvider from '@/providers/AudioProvider'
import OverlayProvider from "@/providers/OverlayProvider"
import Overlay from '@/components/Overlay'
import  Button  from '@/components/Button'
import { TAudio } from '@/types/audio.types'
import { createPortal } from 'react-dom'

const audioData : TAudio = [
  {
      src: song2,
        image : song2Image,
        title: '1Lthree - sleep',
        end: '2:40'
        
    } ,
    {
        src: song1 , 
        image : song1Image,
        title: '1Lthree - take your mind out',
        end: '1:40'
    },
    {
      src: song3,
        image : song3Image,
        title: '1LThree -  suffocation',
        end: '2:40'
    } ,
    {
      src: song4,
        image : song4Image,
        title: 'Cult Member - Midnight in Hel (djpwndu remix)',
        end: '2:40'
    } ,
    {
      src: song5,
        image : song5Image,
        title: 'dj pwndu - phonkeveryday',
        end: '2:40'
    } ,

  ]

const MainPage = () => {
  return (
    <AudioProvider audioData={audioData}>
      {createPortal(<AudioPopup />, document.body)}

      <OverlayProvider>
        <Header isSongRequired={true} />
        <Main  children='SUXXESZ' subtitle="Web developer | UI/UX Designer" />
        {createPortal(
          <Overlay>
            <Button href="/form" className='link' unussual>Write message here...</Button>
          </Overlay>,
          document.body
        )}
      </OverlayProvider>

    </AudioProvider>
  )
}
export default MainPage