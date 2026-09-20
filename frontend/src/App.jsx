import './styles' 
import  Router  from './Router'
import MainPage from './pages/MainPage'
import FormPage from './pages/FormPage'

const routes = {
  '/' : MainPage,
  '/form' : FormPage , 
  '*' : () => <h1>404 Not Found. </h1> , 
  '/biography' : () => <h1>Work in porgress! take the newest news here :<a href='https://t.me/suxxesz_room'></a></h1> ,
  '/policy' : () => <h1>Work in progress! take the newest news:<a href='https://t.me/suxxesz_room'>Here</a></h1>
}

function App() {
  return (
    <Router routes={routes}/>
  )
}
export default App
