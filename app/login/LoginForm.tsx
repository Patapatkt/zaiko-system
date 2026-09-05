"use client"

import { useActionState } from "react";
import { login } from "@/actions/auth";
import Link from "next/link";

export default function Form() {
    const [state, formAction] = useActionState(
        login,
        null
    );
    return (
        <>
            {state?.error && (
                <p className="auth-error">
                    {state.error}
                </p>
            )}
            <form action={formAction}>{/* login関数を実行 */}

                <div className='form-group'>
                    <label className="form-label" htmlFor="email">
                        メールアドレス
                    </label>
                    <input
                        type="email"
                        id='email'
                        name='email'
                        className='form-input'
                        placeholder='example@email.com'
                        required// 以上を必須項目で設定
                    />
                </div>

                <div className='form-group'>
                    <label className='form-label' htmlFor='password'>
                        パスワード
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className='form-input'
                        placeholder='********'
                        required// 以上を必須項目で設定   
                    />
                </div>
                <button
                    type='submit'
                    className='auth-button'
                    style={{ width: '100%', marginBottom: '15px' }}
                >
                    ログイン
                </button>
            </form>

            <Link 
                href="/register"
                className="auth-link"
            >
                新規登録はこちら
            </Link>
        </>
    )
}