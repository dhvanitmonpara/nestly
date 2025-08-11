import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage.tsx'
import Layout from './layouts/Layout.tsx'
import ChatPage from './pages/ChatPage.tsx'
import SelectChatPage from './pages/SelectChatPage.tsx'
import SigninPage from './pages/SigninPage.tsx'
import SignupPage from './pages/SignupPage.tsx'
import AuthLayout from './layouts/AuthLayout.tsx'
import OtpVerfificationPage from './pages/OtpVerfificationPage.tsx'
import UserSetupPage from './pages/UserSetupPage.tsx'
import { SocketProvider } from './socket/socketContext.tsx'
import ProfilePage from './pages/ProfilePage.tsx'
import JoinServerPage from './pages/JoinServerPage.tsx'

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "signin",
        element: <SigninPage />,
      },
      {
        path: "signup",
        element: <SignupPage />,
      },
      {
        path: "verify-otp/:email",
        element: <OtpVerfificationPage />,
      },
      {
        path: "setup/:email",
        element: <UserSetupPage />,
      },
    ]
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <SelectChatPage />,
      },
      {
        path: "/s/:serverId",
        element: <></>,
      },
      {
        path: "/s/:serverId/c/:channelId",
        element: <ChatPage />,
      },
      {
        path: "/join/s/:serverId",
        element: <JoinServerPage />,
      },
      {
        path: "/u/:userId",
        element: <ProfilePage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ]
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  </StrictMode>,
)
