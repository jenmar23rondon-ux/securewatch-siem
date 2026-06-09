import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../services/api";
import { AuthUser } from "../types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must have at least 8 characters")
});

type LoginForm = z.infer<typeof loginSchema>;

type LoginResponse = {
  token: string;
  user: AuthUser;
};

export function Login({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@securewatch.local",
      password: "Admin1234"
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginForm) => {
      const { data } = await api.post<LoginResponse>("/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("securewatch_token", data.token);
      localStorage.setItem("securewatch_user", JSON.stringify(data.user));
      onLogin(data.user);
      navigate("/");
    }
  });

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
        <h1>SecureWatch SIEM</h1>
        <p>Security operations dashboard</p>
        {loginMutation.isError && <div className="error">Could not sign in</div>}
        <label>Email</label>
        <input {...register("email")} />
        {errors.email && <small className="field-error">{errors.email.message}</small>}
        <label>Password</label>
        <input type="password" {...register("password")} />
        {errors.password && <small className="field-error">{errors.password.message}</small>}
        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
