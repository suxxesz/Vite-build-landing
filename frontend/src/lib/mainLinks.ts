import { LucideProps } from 'lucide-react';
import {MailCheck , LucideGitBranch , Send} from 'lucide-react'


interface ILinks {
    name : string , 
    href : string , 
    icon : React.ForwardRefExoticComponent<Omit<LucideProps, "ref">>
  }

export const links : ILinks[] = [
    { name: 'Telegramm', href: 'https://t.me/suxxesz' , icon: Send },
    { name: 'GitHub', href: 'https://github.com/suxxesz' , icon: LucideGitBranch },
    { name: 'Mail', href: 'https://www.upwork.com/freelancers/~014d53cdeff21d99d6' , icon: MailCheck } , 
  ] as const 