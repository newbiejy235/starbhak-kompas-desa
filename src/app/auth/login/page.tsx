import { h1 } from "motion/react-client";
import Link from "next/link";
export default function Login() {
    return (
        <>
        <form>
            <label>Email</label>
            <br></br>
            <input
             className="border"
             type="email" 
             placeholder="Email">
             </input>
             <br></br>
            <label>Password</label>
            <input
            className="border"
            type="Password">
            </input>
            <br></br>
            <button>Masuk</button>
        </form>
        <p>Belum punya akun?</p> <Link className="font-bold text-[#459655]" href="/auth/register">Daftar</Link>
        </>
    )
}