import { getCookie } from 'cookies-next';
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from './lib/service';
 
// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest, res: NextResponse) {
 const { pathname } = req.nextUrl;
  const userId = getCookie('accessCode', { path: '/', req, res })
  if (pathname.startsWith("/_next") || pathname.startsWith('/api')) return NextResponse.next();
  const isAccount = await isvalidAccount(userId)
  
  if((!isAccount || userId === undefined) && !req.nextUrl.pathname.startsWith('/auth')) {
    
    req.nextUrl.pathname = '/auth/login';
    return NextResponse.redirect(req.nextUrl)
  }
  if((isAccount && userId !== undefined) && req.nextUrl.pathname.startsWith('/auth'))    {
    req.nextUrl.pathname = '/'
    return NextResponse.redirect(req.nextUrl)
  }
  if(req.nextUrl.pathname.startsWith('/conversation')) {
   const url = req.nextUrl.pathname.split('/')
    
   const res = await isValid(url[2], url[3])
    if(!res) {
      req.nextUrl.pathname = '/404'
      return NextResponse.redirect(req.nextUrl)
    }  
    NextResponse.next()
  }
  NextResponse.next()

}

const isValid = async (userId: string, conversationId: string) => {
  const result = await prisma.user.findFirst({
    where: {
      id: userId,
      conversations: {
        some: {
          id: conversationId
        }
      }
    }
  })

  return result;
}
const isvalidAccount = async (userId: string) => {
    
  const result = await prisma.user.findFirst({
    where: {
      id: userId
    }
  })
  return result
}