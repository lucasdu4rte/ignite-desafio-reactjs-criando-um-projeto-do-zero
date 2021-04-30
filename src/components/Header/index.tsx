import Head from 'next/head';
import Link from 'next/link';
import styles from './header.module.scss';

interface HeaderProps {
  pageTitle?: string;
}

export function Header({ pageTitle }: HeaderProps): JSX.Element {
  return (
    <>
      <Head>
        <title>{pageTitle ? `${pageTitle} | ` : ''} spacetraveling</title>
      </Head>
      <header className={styles.container}>
        <Link href="/" passHref>
          <a>
            <img src="/logo.svg" alt="logo" />
          </a>
        </Link>
      </header>
    </>
  );
}
