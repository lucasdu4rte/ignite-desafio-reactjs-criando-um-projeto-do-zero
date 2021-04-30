import Link from 'next/link';
import styles from './styles.module.scss';

interface ExitPreviewButtonProps {
  preview: boolean;
}

export const ExitPreviewButton = ({
  preview = false,
}: ExitPreviewButtonProps): JSX.Element => {
  return (
    preview && (
      <aside className={styles.aside}>
        <Link href="/api/exit-preview">
          <a>Sair do modo Preview</a>
        </Link>
      </aside>
    )
  );
};
