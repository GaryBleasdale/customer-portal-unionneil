import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { requireUser } from '~/utils/auth.server'
import { prisma } from '~/utils/prisma.server'
import T from '~/utils/translate'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  if (user.role !== 'CUSTOMER') {
    return redirect('/admin')
  }

  // Get full user details including all registration information
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  if (!fullUser) {
    throw new Response(T('errors.user-not-found'), { status: 404 })
  }

  return { user: fullUser }
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">{T('dashboard.title')}</h1>

        {/* Patient Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">{T('dashboard.patient-info.title')}</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.patient-info.full-name')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name || T('dashboard.not-provided')}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.patient-info.email')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.patient-info.cpf')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.cpf || T('dashboard.not-provided')}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.patient-info.nationality')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.nationality || T('dashboard.not-provided')}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.patient-info.address')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.address || T('dashboard.not-provided')}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Legal Representative Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">{T('dashboard.legal-rep-info.title')}</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.legal-rep-info.full-name')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.legalRepName || T('dashboard.not-provided')}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.legal-rep-info.cpf')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.legalRepCpf || T('dashboard.not-provided')}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.legal-rep-info.nationality')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.legalRepNationality || T('dashboard.not-provided')}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.legal-rep-info.relationship')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.legalRepRelationship || T('dashboard.not-provided')}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.legal-rep-info.email')}</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.legalRepEmail || T('dashboard.not-provided')}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Invoice Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">{T('dashboard.invoice-info.title')}</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.invoice-info.name')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.invoiceName || T('dashboard.invoice-info.same-as-legal-rep')}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.invoice-info.cpf-cnpj')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.invoiceCpfCnpj || T('dashboard.invoice-info.same-as-legal-rep')}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.invoice-info.address')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.invoiceAddress || T('dashboard.invoice-info.same-as-legal-rep')}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.invoice-info.email')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.invoiceEmail || T('dashboard.invoice-info.same-as-legal-rep')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Monthly Invoice Recipients */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">{T('dashboard.billing-recipients.title')}</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl>
              <div>
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.billing-recipients.additional-emails')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.billingEmails && user.billingEmails.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {user.billingEmails.map((email, index) => (
                        <li key={index}>{email}</li>
                      ))}
                    </ul>
                  ) : (
                    T('dashboard.billing-recipients.no-recipients')
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">{T('dashboard.account-info.title')}</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.account-info.member-since')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.account-info.last-login')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : T('dashboard.account-info.never')}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">{T('dashboard.account-info.status')}</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {T('dashboard.account-info.active')}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
