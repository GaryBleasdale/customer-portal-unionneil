import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { logout } from '~/utils/auth.server'

export async function action({ request }: ActionFunctionArgs) {
  return logout(request)
}

// Redirect to login if someone tries to visit /logout directly
export async function loader({ request }: LoaderFunctionArgs) {
  return redirect('/login')
}
