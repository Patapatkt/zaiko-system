
import { getSession } from '@/actions/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm'

//loginPage関数作成
export default async function LoginPage() {
    const session = await getSession();

    if (session) {  //もしログイン済みなら
        redirect("/inventory"); //inventoryページへ移動
    }

    return (
        <main className='auth-page'>
            <section className='auth-card'>
                <h1 className='auth-title'>
                    ログイン
                </h1>

                <LoginForm />
            </section>
        </main>
    )

}
