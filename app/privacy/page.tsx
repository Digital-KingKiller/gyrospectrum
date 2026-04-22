export default function PrivacyPage() {
    return (
        <div className="max-w-2xl mx-auto p-8 prose">
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
                This is a development privacy policy for the GyroSpectrum application.
                We do not collect any real user data in this development environment.
            </p>
            <h2>LinkedIn Data</h2>
            <p>
                If you connect your LinkedIn account, we fetch your profile information
                (Name, ID, Photo) solely to display it within the application and to
                post content on your behalf when you explicitly click "Post".
            </p>
            <p>
                We do not store your data permanently or share it with third parties.
            </p>
        </div>
    )
}
