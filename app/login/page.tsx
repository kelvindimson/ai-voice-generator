// app/login/page.tsx
"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import toast from "react-hot-toast"

export default function LoginPage() {
 const { data: session, status } = useSession()
 const [showSignOutDialog, setShowSignOutDialog] = useState(false)

 const handleSignOut = async () => {
   setShowSignOutDialog(false)
   await signOut({ redirect: false })
   toast.success("Signed out successfully!", {
    id: "signout-success",
    //  duration: 3000,
    //  position: "top-center",
    //  style: {
    //    background: "#10b981",
    //    color: "#fff",
    //  },
   })
 }

 if (status === "loading") {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
       <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
     </div>
   )
 }

 return (
   <>
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
       <Card className="w-full max-w-md shadow-none p-12">
         {!session ? (
           <>
             {/* Logged Out View */}
             <CardHeader className="space-y-1 text-center">
               <CardTitle className="text-3xl font-bold">
                 Welcome Back
               </CardTitle>
               <CardDescription>
                 Sign in to access your audio library
               </CardDescription>
             </CardHeader>
             
             <CardContent className="space-y-4">
               <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                   <Separator />
                 </div>
                 <div className="relative flex justify-center text-sm">
                   <span className="px-4 bg-background text-muted-foreground">
                     Continue with
                   </span>
                 </div>
               </div>

               <Button
                 onClick={() => signIn("google")}
                 variant="outline"
                 className="w-full py-6 rounded-full shadow-none"
                 size="lg"
               >
                 <FcGoogle className="mr-2 h-5 w-5" />
                 Sign in with Google
               </Button>
             </CardContent>

             <CardFooter>
               <p className="text-center text-sm text-muted-foreground w-full">
                 By signing in, you agree to our{" "}
                 <a href="#" className="text-primary hover:underline">
                   Terms
                 </a>{" "}
                 and{" "}
                 <a href="#" className="text-primary hover:underline">
                   Privacy Policy
                 </a>
               </p>
             </CardFooter>
           </>
         ) : (
           <>
             {/* Logged In View */}
             <CardHeader className="text-center">
               <CardTitle className="text-2xl">
                 Welcome, {session.user?.name}!
               </CardTitle>
             </CardHeader>
             
             <CardContent className="space-y-6">
               <div className="flex flex-col items-center space-y-4">
                 <Avatar className="h-20 w-20">
                   <AvatarImage src={session.user?.image || ""} alt="Profile" />
                   <AvatarFallback>
                     {session.user?.name?.charAt(0).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
                 
                 <div className="space-y-1 text-center">
                   <p className="font-medium text-sm">{session.user?.email}</p>
                   <p className="text-xs text-muted-foreground">
                     Signed in with Google
                   </p>
                 </div>
               </div>

               <Separator className="w-10 "/>

               <div className="space-y-3">
                 <Button asChild className="w-full py-6 rounded-full" size="lg">
                   <a href="/audio">Go to Dashboard</a>
                 </Button>
                 <hr className="w-20 my-4 mx-auto" />
                 <Button
                   onClick={() => setShowSignOutDialog(true)}
                   variant="destructive"
                   className="w-full py-6 rounded-full" size="lg"
                 >
                   Sign Out
                 </Button>
               </div>
             </CardContent>
           </>
         )}
       </Card>

       {/* Sign Out Confirmation Dialog */}
       <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
             <AlertDialogDescription>
               You&apos;ll need to sign in again to access your audio library.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleSignOut}>
               Sign Out
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
     </div>
   </>
 )
}