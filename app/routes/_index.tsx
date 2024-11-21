import type { MetaFunction } from "@remix-run/node";
import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { getUserFromSession } from '~/utils/auth.server'

export const meta: MetaFunction = () => {
  return [
    { title: "Customer Portal" },
    { name: "description", content: "Welcome to the Customer Portal" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromSession(request)
  
  if (user) {
    return redirect(user.role === 'ADMIN' ? '/admin' : '/dashboard')
  }

  return redirect('/login')
}

export default function Index() {
  return null
}
