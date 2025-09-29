import { Link, Outlet } from 'react-router-dom'

export default function ProfileLayout() {
  return (
    <div>
      <h1>This is the profile layout!</h1>
      <Link to="/">Return to homepage</Link>
      <Outlet />
    </div>
  )
}
