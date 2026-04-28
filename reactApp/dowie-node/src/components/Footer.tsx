import winOneLogo from "@/assets/winone-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={winOneLogo} alt="WinOne logo" className="h-7 w-7 rounded-md object-contain" />
            <span className="text-sm font-bold text-foreground">
              Win<span className="text-gradient-primary">One</span>
            </span>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">Blog</a>
            <a href="#" className="hover:text-foreground transition-colors">Careers</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 WinOne. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
