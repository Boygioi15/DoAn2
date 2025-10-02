import { useContext, useState } from 'react'
import './Auth.css'
import silksong from '../../assets/silksong_1.png'
import { SignInBox, SignUpBox } from './AuthBox'
import { AuthPageContext } from '../../layouts/AuthLayout/AuthLayout'

//state 1: login, state 2: sign up
export default function SignInUpPage() {
  const { authState, setAuthState } = useContext(AuthPageContext)

  const handleStateChange = (e) => {
    if (authState === 1) {
      setAuthState(2)
    } else {
      setAuthState(1)
    }
  }
  let authBox
  switch (authState) {
    case 1:
      authBox = <SignInBox onStateChange={handleStateChange} />
      break
    case 2:
      authBox = <SignUpBox onStateChange={handleStateChange} />
      break
  }

  return (
    <div className="SignInUpPage">
      <img className="SignInUpPage_Thumbnail" src={silksong} />
      {authBox}
    </div>
  )
}
