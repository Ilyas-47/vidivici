import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court")
});

const registerSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères")
});

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' }
  });

  // Si déjà connecté, redirection vers /account
  if (session) {
    return <Navigate to="/account" replace />;
  }

  const onLogin = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      if (error) throw error;
      toast.success('Connexion réussie');
      navigate('/account');
    } catch (error: any) {
      toast.error('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName
          }
        }
      });
      if (error) throw error;
      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      setIsLogin(true);
      registerForm.reset();
    } catch (error: any) {
      toast.error('Erreur lors de l\'inscription : ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 mt-12">
        <div className="flex justify-center gap-8 border-b border-gray-100 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`pb-4 text-xs uppercase tracking-wider transition-colors ${
              isLogin ? 'border-b-2 border-black text-black' : 'text-gray-400'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`pb-4 text-xs uppercase tracking-wider transition-colors ${
              !isLogin ? 'border-b-2 border-black text-black' : 'text-gray-400'
            }`}
          >
            Inscription
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-500">Email</label>
              <input
                type="email"
                {...loginForm.register('email')}
                className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
              />
              {loginForm.formState.errors.email && (
                <p className="text-xs text-red-500">{loginForm.formState.errors.email.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-500">Mot de passe</label>
              <input
                type="password"
                {...loginForm.register('password')}
                className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-red-500">{loginForm.formState.errors.password.message as string}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : 'Se Connecter'}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500">Prénom</label>
                <input
                  type="text"
                  {...registerForm.register('firstName')}
                  className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
                />
                {registerForm.formState.errors.firstName && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.firstName.message as string}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-gray-500">Nom</label>
                <input
                  type="text"
                  {...registerForm.register('lastName')}
                  className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
                />
                {registerForm.formState.errors.lastName && (
                  <p className="text-xs text-red-500">{registerForm.formState.errors.lastName.message as string}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-500">Email</label>
              <input
                type="email"
                {...registerForm.register('email')}
                className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
              />
              {registerForm.formState.errors.email && (
                <p className="text-xs text-red-500">{registerForm.formState.errors.email.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-gray-500">Mot de passe</label>
              <input
                type="password"
                {...registerForm.register('password')}
                className="w-full border border-gray-300 p-3 focus:border-black focus:outline-none"
              />
              {registerForm.formState.errors.password && (
                <p className="text-xs text-red-500">{registerForm.formState.errors.password.message as string}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Chargement...' : 'Créer un compte'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
