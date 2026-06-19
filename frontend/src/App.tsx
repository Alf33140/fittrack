
import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthProvider'

import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
// import Exercises from './pages/Exercises'
// import Workouts from './pages.Workouts'
// import WorkoutDetail from './pages WorkoutDetail'
// import Profile from '.pages/Profile' 

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#334155',
                color: '#F1F5F9',
                border: '1px solid #334155',
            },
          }}
        />
        <Routes>
          {/* Routes Publiques 
          Accessibles sans être connectés */}

          <Route path="/login" element={<Login />}  /> 
          <Route path="/register" element={<Register />}  /> 

          {/* Routes Privées 
          PrivateRoute vérifie le token JWT ; si absent - <redirection /Login>
          Layout ajoute la sidebar et la zone de contenu principale.
          Toutes les pages imbriquées héritent de cette protection.*/}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/Dashboard" element={<Dashboard />}  />
                {/* <Route path="/Exercises" element={<Exercises />}  />
                <Route path="/Workouts" element={<Workouts />}  /> */}
                {/* :id = parametren dynamique récupéré avec useParams( WorkoutDetail) */}
                {/* <Route path="/Workouts/:id" element={<WorkoutDetail />}  />
                <Route path="/Profile" element={<Profile />}  /> */}
              </Route>
            </Route>
            
            {/* --- Fallback ---
          Toute URL inconnue redirige vers le Dashboard
          replace évite d'empiler une entrée dans l historique de navigation */}
            <Route path="*" element={<Navigate to="/dashboard" replace />}  />

           
        </Routes>         
      </BrowserRouter>
    </AuthProvider>
  )
}