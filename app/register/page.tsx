// ユーザー登録ページ
"use client";

import { registerUser } from "@/actions/auth"
import { useActionState } from "react";

export default function RegisterPage() {

    const [state, formAction] = useActionState(
        registerUser,
        null
    )

    return (
        <main className="auth-page">
            <div className="auth-card">
                <section>
                    <h1 className="auth-title">
                        ユーザー登録
                    </h1>
                    {state?.error && (
                        <p className="auth-error">
                            {state.error}
                        </p>
                    )}

                    <form action={formAction}>
                        <div className="form-group">
                            <label className="auth-label">
                                ユーザー名
                            </label>
                            <input
                                type="text"
                                name="username"
                                className="form-input"
                                required//必須項目
                            />
                        </div>

                        <div>
                            <label className="label">
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                required//必須項目
                            />
                        </div>

                        <div>
                            <label className="auth-label">
                                パスワード
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                required//必須項目
                            />
                        </div>

                        <button 
                            type="submit"
                            className="auth-button"
                        >
                            登録
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}