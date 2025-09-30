import { useState } from 'react'
import './Auth.css'
import silksong from '../../assets/silksong_1.png'
import { SignInBox } from './Auth_comps'

//state 1: login, state 2: sign up
export default function SignInUpPage({ initState = 1 }) {
  const [state, setState] = useState(initState)

  return (
    <div className="SignInUpPage">
      This is the in up page
      <img className="SignInUpPage_Thumbnail" src={silksong} />
      <SignInBox />
    </div>
  )
}
