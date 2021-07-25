import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, Switch, Text, View } from 'react-native'
import * as TaskManager from 'expo-task-manager'
import * as Location from 'expo-location'
import {
    getBackgroundPermissionsAsync,
    LocationAccuracy,
    LocationPermissionResponse,
    PermissionStatus,
    requestBackgroundPermissionsAsync,
} from 'expo-location'
import useInterval from 'use-interval'

export const LOCATION_TASK_NAME = 'location'

export async function locationTaskAsync({
    data,
    error,
}: TaskManager.TaskManagerTaskBody): Promise<void> {
    if (error) {
        Alert.alert('location task error', JSON.stringify(error))
        return
    }

    Alert.alert('location task', JSON.stringify(data))
}

TaskManager.defineTask(LOCATION_TASK_NAME, locationTaskAsync)

async function startLocationUpdatesAsync(): Promise<void> {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)

    if (!started) {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: LocationAccuracy.BestForNavigation,
            activityType: Location.ActivityType.AutomotiveNavigation,
        })
    }
}

async function stopLocationUpdatesAsync(): Promise<void> {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)

    if (started) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
    }
}

function onError(e: any): void {
    Alert.alert('Error!', JSON.stringify(e))
}

export default function App() {
    const [enableLocationTask, setEnableLocationTask] = useState(false)

    const [permission, setPermission] = useState<LocationPermissionResponse>()
    const permissionStatus = permission?.status

    useEffect(() => {
        requestBackgroundPermissionsAsync().catch(onError)
    }, [])

    useInterval(
        () => {
            getBackgroundPermissionsAsync().then(setPermission).catch(onError)
        },
        10 * 1000,
        true
    )

    useEffect(() => {
        if (permissionStatus !== PermissionStatus.GRANTED) return

        if (enableLocationTask) {
            startLocationUpdatesAsync().catch(onError)
        } else {
            stopLocationUpdatesAsync().catch(onError)
        }
    }, [permissionStatus, enableLocationTask])

    return (
        <View style={styles.container}>
            <Text style={{ marginBottom: 16 }}>
                Permission status: {permissionStatus}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch
                    onValueChange={() => setEnableLocationTask((b) => !b)}
                    value={enableLocationTask}
                />
                <Text>Enable location task</Text>
            </View>
            <StatusBar style="auto" />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
