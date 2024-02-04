import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import {NextSeo} from 'next-seo'
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
    <Toaster position='top-center'/>
    <NextSeo
      themeColor='blue'
      title='Welcome to Chattr Box!'
      description='Unlock your conversations.'
    />
    <Component {...pageProps} /> 
    </>
     
  ) 
}
