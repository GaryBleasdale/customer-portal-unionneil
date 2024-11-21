import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Link, Outlet, useLocation } from '@remix-run/react'
import { requireAdmin } from '~/utils/auth.server'
import { prisma } from '~/utils/prisma.server'

export async function loader({ request }: LoaderFunctionArgs) {
  // This will redirect to /login if not authenticated or not an admin
  await requireAdmin(request)

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    totalCustomers: customers.length,
    newCustomersToday: customers.filter(
      c => c.createdAt.toDateString() === new Date().toDateString()
    ).length,
    activeCustomers: customers.filter(
      c => c.lastLoginAt && new Date(c.lastLoginAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length,
  }

  return json({ customers, stats })
}

export default function Admin() {
  const { customers, stats } = useLoaderData<typeof loader>()
  const location = useLocation()
  const isCustomerDetails = location.pathname.includes('/customers/')

  if (isCustomerDetails) {
    return <Outlet />
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Customers</h2>
          <p className="text-3xl">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">New Customers Today</h2>
          <p className="text-3xl">{stats.newCustomersToday}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Active Past Week</h2>
          <p className="text-3xl">{stats.activeCustomers}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-4 border-b">Customer List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Joined</th>
                <th className="px-4 py-2 text-left">Last Login</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{customer.name || 'N/A'}</td>
                  <td className="px-4 py-2">{customer.email}</td>
                  <td className="px-4 py-2">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {customer.lastLoginAt 
                      ? new Date(customer.lastLoginAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`customers/${customer.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center text-sm text-gray-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
