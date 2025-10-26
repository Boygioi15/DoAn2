import { useContext, useState } from 'react';
import './Auth.css';
import silksong from '../../assets/silksong_1.png';
import { SignInBox, SignUpBox } from './AuthBox';

export function SignInPage() {
  return (
    <div className="SignInUpPage">
      <img className="SignInUpPage_Thumbnail" src={silksong} />
      <SignInBox />
    </div>
  );
}
export function SignUpPage() {
  return (
    <div className="SignInUpPage">
      <img className="SignInUpPage_Thumbnail" src={silksong} />
      <SignUpBox />
    </div>
  );
}
