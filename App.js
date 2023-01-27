import React, { useState, useEffect } from "react"
import { Text, View, StyleSheet, Button } from "react-native"
import { BarCodeScanner } from "expo-barcode-scanner"

export default function App() {
  const [hasPermission, setHasPermission] = useState(null)
  const [userData, setUserData] = useState(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === "granted")
    }

    getBarCodeScannerPermissions()
  }, [])

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true)
    const res = await fetch(`http://192.168.1.121:5000/qr-codes/validate-code/${data}`)

    if (!res.ok) return alert("Error validating code")

    const result = await res.json()
    if (result.hasError) return alert(result.errorMessage)

    const userRes = await fetch(`http://192.168.1.121:5000/users/${result.userId}`)

    if (!res.ok) return alert("Error getting user")
    const userResult = await userRes.json()
    setUserData(userResult)
  }

  function clearUser() {
    setUserData(null)
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <Text style={{ fontSize: 36, fontWeight: "500" }}>Username: </Text>
            <Text style={{ fontSize: 36 }}>{userData.name}</Text>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "500" }}>UserId: </Text>
            <Text style={{ fontSize: 18 }}>{userData.id}</Text>
          </View>
          <Button onPress={clearUser} title="Clear User Data" />
        </>
      ) : (
        <>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          {scanned && <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
})
