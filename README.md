# FAITHLED Payment Dashboard

A modern, responsive web application for managing school payments, students, expenses, and more. Built with React, Vite, TypeScript, Material-UI, and Supabase.

## Features

- 📱 Mobile-first, responsive UI
- 🌗 Dark mode support
- 🧑‍🎓 Student management (add, edit, delete, view details)
- 💸 Payment tracking and debtor management
- 📚 Book and expense management
- 📊 Download payment data as Excel (with formatting)
- 🔒 Secure environment variable handling
- ⚡ Fast, open-source stack

## Getting Started

1. **Clone the repository**
	```bash
	git clone https://github.com/Haleel999/FAITHLED-PAYMENT-DASHBOARD.git
	cd FAITHLED-PAYMENT-DASHBOARD/frontend
	```

2. **Install dependencies**
	```bash
	npm install
	```

3. **Set up environment variables**
	- Create a `.env` file in the `frontend` folder:
	  ```
	  VITE_SUPABASE_URL=your-supabase-url
	  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
	  ```

4. **Run the app locally**
	```bash
	npm run dev
	```

## Deployment

- Recommended: [Vercel](https://vercel.com) (see detailed deployment instructions in this repo or ask for help!)
- Set environment variables in your hosting dashboard, never commit `.env` to your repo.

## Contributing

Pull requests and suggestions are welcome! Please open an issue for major changes.
