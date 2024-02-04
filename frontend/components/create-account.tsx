import { useRouter } from "next/router"
import { FormEvent, useState } from "react"
import toast from 'react-hot-toast'
import axios from 'axios'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CreateAccount() {
  const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    
    const onClick =  async (e: FormEvent) => {
      e.preventDefault()
      try {
        const req = await axios.post('/api/auth/createAccountHandler', {
          data: {
              username,
              password,
              name,
              email
          }
      })
      if(req.status === 200) {
          toast.success('Successfully created a new account!')
          return router.push('/')

      }
      }catch (e){
        return toast.error(`Error: Email is already in use!`)

      }
       
        
         
     }

  return (
    <div className="min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl" />
        <div className="relative px-4 py-10 bg-gray-800 text-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <img className="h-7 sm:h-8" src="/placeholder.svg" />
            </div>
            <div className="divide-y divide-gray-600">
            <form>

              <div className="py-8 text-base leading-6 space-y-4 sm:text-lg sm:leading-7">

              <div className="relative">
                  <Label className="leading-7 text-sm text-gray-400" htmlFor="name">
                    Name
                  </Label>
                  <Input onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-gray-700 text-white" id="name" type="name" />
                </div>
                <div className="relative">
                  <Label  className="leading-7 text-sm text-gray-400" htmlFor="username">
                    Username
                  </Label>
                  <Input onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full bg-gray-700 text-white" id="username" type="text" />
                </div>
                <div className="relative">
                  <Label className="leading-7 text-sm text-gray-400" htmlFor="email">
                    Email
                  </Label>
                  <Input onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full bg-gray-700 text-white" id="email" type="email" />
                </div>
                <div className="relative">
                  <Label className="leading-7 text-sm text-gray-400" htmlFor="password">
                    Password
                  </Label>
                  <Input onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full bg-gray-700 text-white" id="password" type="password" />
                </div>
                <Button
                  type="submit"
                  onClick={(e) => onClick(e)}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                >
                  Sign Up
                </Button>
              </div>
              <div className="pt-6 text-base leading-6 font-bold sm:text-lg sm:leading-7">
                <p>Already have an account?</p>
                <Link className="text-blue-400 hover:text-blue-300" href="/auth/login">
                  {" "}
                  Log in
                </Link>
      
              </div>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
